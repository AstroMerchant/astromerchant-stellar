import axios from 'axios';
import { config } from '../config';
import { streamPayments } from '../horizon/horizon.service';
import { verifyTransaction } from '../payments/payments.service';
import type { PaymentOperation } from '../types';

interface ActiveListener {
  publicKey: string;
  merchantId: string;
  closeStream: () => void;
}

const activeListeners: Map<string, ActiveListener> = new Map();

export async function startPaymentListener(
  merchantPublicKey: string,
  merchantId: string
): Promise<void> {
  if (activeListeners.has(merchantPublicKey)) {
    console.log(
      `Listener already active for ${merchantPublicKey}, skipping...`
    );
    return;
  }

  const onPayment = async (payment: PaymentOperation) => {
    try {
      console.log(
        `Incoming payment detected for merchant ${merchantId}:`,
        payment.transactionHash
      );

      const verification = await verifyTransaction(payment.transactionHash);

      if (!verification.verified) {
        console.warn(
          `Payment verification failed for tx ${payment.transactionHash}`
        );
        return;
      }

      const payload = {
        merchantId,
        txHash: payment.transactionHash,
        amount: verification.amount,
        asset: verification.asset,
        fromAddress: verification.from,
        memo: verification.memo,
        status: 'confirmed',
      };

      await axios.post(
        `${config.merchantServerUrl}/api/v1/payments/callback`,
        payload,
        {
          headers: {
            'x-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(
        `Payment ${payment.transactionHash} recorded for merchant ${merchantId}`
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error processing payment for merchant ${merchantId}:`,
          error.message
        );
      }
    }
  };

  const closeStream = await streamPayments(merchantPublicKey, onPayment);

  activeListeners.set(merchantPublicKey, {
    publicKey: merchantPublicKey,
    merchantId,
    closeStream,
  });

  console.log(
    `Payment listener started for merchant ${merchantId} (${merchantPublicKey})`
  );
}

export function stopPaymentListener(merchantPublicKey: string): void {
  const listener = activeListeners.get(merchantPublicKey);
  if (listener) {
    listener.closeStream();
    activeListeners.delete(merchantPublicKey);
    console.log(
      `Payment listener stopped for ${merchantPublicKey}`
    );
  }
}

export function getActiveListeners(): Map<string, ActiveListener> {
  return activeListeners;
}
