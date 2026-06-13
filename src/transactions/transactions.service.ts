import { getServer } from '../stellar/client';
import type { TransactionInfo } from '../types';

export async function getTransaction(
  txHash: string
): Promise<TransactionInfo> {
  try {
    const tx = await getServer().transactions().transaction(txHash).call();

    const operations = await getServer()
      .operations()
      .forTransaction(txHash)
      .call();

    const paymentOps = operations.records.filter(
      (op: any) => op.type === 'payment'
    );

    let amount = '0';
    let asset = 'XLM';
    let from = '';
    let to = '';

    if (paymentOps.length > 0) {
      const op = paymentOps[0];
      amount = op.amount;
      asset = op.asset_type === 'native' ? 'XLM' : op.asset_code;
      from = op.from;
      to = op.to;
    }

    return {
      hash: tx.hash,
      type: tx.type || 'payment',
      amount,
      asset,
      from,
      to,
      memo: tx.memo || '',
      status: tx.successful ? 'success' : 'failed',
      createdAt: tx.created_at,
      ledger: tx.ledger,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
    throw new Error('Failed to get transaction: Unknown error');
  }
}

export async function getRecentTransactions(
  publicKey: string,
  limit: number = 20
): Promise<TransactionInfo[]> {
  try {
    const operations = await getServer()
      .operations()
      .forAccount(publicKey)
      .limit(limit)
      .order('desc')
      .call();

    const paymentOps = operations.records.filter(
      (op: any) => op.type === 'payment'
    );

    return paymentOps.map((op: any) => ({
      hash: op.transaction_hash,
      type: op.type,
      amount: op.amount,
      asset: op.asset_type === 'native' ? 'XLM' : op.asset_code || 'XLM',
      from: op.from,
      to: op.to,
      memo: op.memo || '',
      status: 'success',
      createdAt: op.created_at,
      ledger: op.ledger || 0,
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to get recent transactions: ${error.message}`
      );
    }
    throw new Error('Failed to get recent transactions: Unknown error');
  }
}

export async function decodeTransactionResult(
  txJson: any
): Promise<TransactionInfo> {
  const paymentOps = (txJson.operations || []).filter(
    (op: any) => op.type === 'payment'
  );

  let amount = '0';
  let asset = 'XLM';
  let from = '';
  let to = '';

  if (paymentOps.length > 0) {
    const op = paymentOps[0];
    amount = op.amount;
    asset = op.asset_type === 'native' ? 'XLM' : op.asset_code;
    from = op.from;
    to = op.to;
  }

  return {
    hash: txJson.hash || txJson.id || '',
    type: txJson.type || 'payment',
    amount,
    asset,
    from,
    to,
    memo: txJson.memo || '',
    status: txJson.successful ? 'success' : 'failed',
    createdAt: txJson.created_at || new Date().toISOString(),
    ledger: txJson.ledger || 0,
  };
}

export async function isTransactionSuccessful(
  txHash: string
): Promise<boolean> {
  try {
    const tx = await getServer().transactions().transaction(txHash).call();
    return tx.successful === true;
  } catch (error) {
    return false;
  }
}
