import { v4 as uuidv4 } from 'uuid';
import {
  getServer,
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
  Memo,
  getNetwork,
} from '../stellar/client';
import type {
  GeneratePaymentAddressResult,
  VerifyTransactionResult,
  SettlementResult,
  PaymentOperation,
} from '../types';

export function generatePaymentAddress(
  merchantPublicKey: string,
  amount: string,
  assetCode: string
): GeneratePaymentAddressResult {
  const memo = uuidv4().replace(/-/g, '').substring(0, 16);

  return {
    destinationAddress: merchantPublicKey,
    memo,
  };
}

export async function verifyTransaction(
  stellarTxHash: string
): Promise<VerifyTransactionResult> {
  try {
    const tx = await getServer().transactions().transaction(stellarTxHash).call() as any;

    const operations = await getServer()
      .operations()
      .forTransaction(stellarTxHash)
      .call();

    const paymentOps = (operations.records as any[]).filter(
      (op: any) => op.type === 'payment'
    );

    if (paymentOps.length === 0) {
      return {
        verified: false,
        amount: '0',
        asset: '',
        from: '',
        to: '',
        memo: '',
        txHash: stellarTxHash,
      };
    }

    const paymentOp = paymentOps[0] as any;

    const assetType = paymentOp.asset_type === 'native' ? 'XLM' : paymentOp.asset_code || 'XLM';

    return {
      verified: true,
      amount: paymentOp.amount,
      asset: assetType,
      from: paymentOp.from,
      to: paymentOp.to,
      memo: tx.memo || '',
      txHash: stellarTxHash,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to verify transaction: ${error.message}`);
    }
    throw new Error('Failed to verify transaction: Unknown error');
  }
}

export async function watchIncomingPayments(
  merchantPublicKey: string,
  callback: (payment: PaymentOperation) => void
): Promise<() => void> {
  const stream = getServer()
    .operations()
    .forAccount(merchantPublicKey)
    .cursor('now')
    .stream({
      onmessage: (operation: any) => {
        if (operation.type === 'payment') {
          const payment: PaymentOperation = {
            id: operation.id,
            type: operation.type,
            amount: operation.amount,
            assetType: operation.asset_type,
            assetCode: operation.asset_code || undefined,
            assetIssuer: operation.asset_issuer || undefined,
            from: operation.from,
            to: operation.to,
            memo: operation.memo || undefined,
            memoType: operation.memo_type || undefined,
            transactionHash: operation.transaction_hash,
            createdAt: operation.created_at,
            sourceAccount: operation.source_account || operation.source_account,
          };
          callback(payment);
        }
      },
      onerror: (error: any) => {
        console.error(`Stream error for ${merchantPublicKey}:`, error.message || error);
      },
    });

  return () => {
    stream();
  };
}

export async function sendSettlement(
  destinationPublicKey: string,
  amount: string,
  assetCode: string,
  sourceSecretKey: string
): Promise<SettlementResult> {
  try {
    const sourceKeypair = Keypair.fromSecret(sourceSecretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    const sourceAccount = await (getServer() as any).loadAccount(sourcePublicKey);

    let asset;
    if (assetCode.toUpperCase() === 'XLM') {
      asset = Asset.native();
    } else {
      const balances = sourceAccount.balances.filter(
        (b: any) => b.asset_code === assetCode
      );
      if (balances.length === 0) {
        return {
          success: false,
          error: `No trustline found for asset ${assetCode}`,
        };
      }
      asset = new Asset(assetCode, balances[0].asset_issuer);
    }

    const { passphrase } = getNetwork();

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: passphrase,
    })
      .addOperation(
        Operation.payment({
          destination: destinationPublicKey,
          asset,
          amount,
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);

    const result = await (getServer() as any).submitTransaction(transaction);

    return {
      success: true,
      txHash: result.hash,
    };
  } catch (error: any) {
    const message = error?.response?.data?.extras?.result_codes
      ? JSON.stringify(error.response.data.extras.result_codes)
      : error instanceof Error
        ? error.message
        : 'Unknown error';
    return {
      success: false,
      error: `Settlement failed: ${message}`,
    };
  }
}
