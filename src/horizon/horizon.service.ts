import { getServer } from '../stellar/client';
import type { PaymentOperation } from '../types';

export async function submitTransaction(
  envelopeXdr: string
): Promise<{ hash: string; ledger: number }> {
  try {
    const result = await (getServer() as any).submitTransaction(envelopeXdr);
    return {
      hash: result.hash,
      ledger: result.ledger,
    };
  } catch (error: any) {
    const message = error?.response?.data?.extras?.result_codes
      ? JSON.stringify(error.response.data.extras.result_codes)
      : error instanceof Error
        ? error.message
        : 'Unknown error';
    throw new Error(`Transaction submission failed: ${message}`);
  }
}

export async function streamPayments(
  publicKey: string,
  onPayment: (payment: PaymentOperation) => void
): Promise<() => void> {
  const closeStream = getServer()
    .operations()
    .forAccount(publicKey)
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
            sourceAccount: operation.source_account,
          };
          onPayment(payment);
        }
      },
      onerror: (error: any) => {
        console.error(`Stream error for ${publicKey}:`, error.message || error);
      },
    });

  return closeStream;
}

export async function getOperations(
  publicKey: string,
  cursor?: string
): Promise<{ operations: any[]; nextCursor: string }> {
  try {
    const builder = getServer()
      .operations()
      .forAccount(publicKey)
      .limit(50)
      .order('desc');

    if (cursor) {
      builder.cursor(cursor);
    }

    const result = await builder.call();

    return {
      operations: result.records,
      nextCursor: (result as any)._next?.cursor || '',
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get operations: ${error.message}`);
    }
    throw new Error('Failed to get operations: Unknown error');
  }
}

export async function getLatestLedger(): Promise<number> {
  try {
    const root = await (getServer() as any).root();
    return root.horizon_sequence || 0;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get latest ledger: ${error.message}`);
    }
    throw new Error('Failed to get latest ledger: Unknown error');
  }
}
