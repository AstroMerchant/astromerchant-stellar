import { getAccountInfo, getBalance } from '../accounts/accounts.service';
import { getRecentTransactions, isTransactionSuccessful } from '../transactions/transactions.service';
import type { AccountInfo, AccountBalance, TransactionInfo } from '../types';

export interface MerchantSyncResult {
  merchantId: string;
  publicKey: string;
  balances: AccountBalance[];
  recentTransactions: TransactionInfo[];
  pendingCount: number;
}

export async function syncMerchantWallet(
  merchantId: string,
  publicKey: string
): Promise<MerchantSyncResult> {
  try {
    const info: AccountInfo = await getAccountInfo(publicKey);
    const recentTransactions: TransactionInfo[] = await getRecentTransactions(
      publicKey,
      20
    );

    const pendingCount = recentTransactions.filter(
      (tx) => tx.status === 'pending' || tx.status === 'failed'
    ).length;

    return {
      merchantId,
      publicKey,
      balances: info.balances,
      recentTransactions,
      pendingCount,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to sync merchant wallet: ${error.message}`
      );
    }
    throw new Error('Failed to sync merchant wallet: Unknown error');
  }
}

export interface PendingPayment {
  txHash: string;
  amount: string;
  asset: string;
  from: string;
  to: string;
  memo: string;
  createdAt: string;
}

export async function processPendingPayments(
  merchantId: string
): Promise<PendingPayment[]> {
  try {
    const confirmedPayments: PendingPayment[] = [];

    const transactions = await getRecentTransactions(merchantId, 50);
    const pendingTransactions = transactions.filter(
      (tx) => tx.status === 'pending' || tx.status === 'failed'
    );

    for (const tx of pendingTransactions) {
      const successful = await isTransactionSuccessful(tx.hash);
      if (successful) {
        confirmedPayments.push({
          txHash: tx.hash,
          amount: tx.amount,
          asset: tx.asset,
          from: tx.from,
          to: tx.to,
          memo: tx.memo,
          createdAt: tx.createdAt,
        });
      }
    }

    return confirmedPayments;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to process pending payments: ${error.message}`
      );
    }
    throw new Error('Failed to process pending payments: Unknown error');
  }
}
