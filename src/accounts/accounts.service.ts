import axios from 'axios';
import { Keypair, getServer } from '../stellar/client';
import type {
  WalletInfo,
  AccountInfo,
  AccountBalance,
} from '../types';

export async function createMerchantWallet(): Promise<WalletInfo> {
  try {
    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    const friendbotUrl = `https://friendbot.stellar.org?addr=${publicKey}`;
    const response = await axios.get(friendbotUrl);

    if (response.status !== 200) {
      throw new Error(`Friendbot funding failed with status ${response.status}`);
    }

    const accountInfo = await getServer().loadAccount(publicKey);
    const xlmBalance = accountInfo.balances.find(
      (b: any) => b.asset_type === 'native'
    );

    return {
      publicKey,
      secretKey,
      balance: xlmBalance ? xlmBalance.balance : '0',
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create merchant wallet: ${error.message}`);
    }
    throw new Error('Failed to create merchant wallet: Unknown error');
  }
}

export async function getAccountInfo(publicKey: string): Promise<AccountInfo> {
  try {
    const account = await getServer().loadAccount(publicKey);

    const balances: AccountBalance[] = account.balances.map((b: any) => ({
      balance: b.balance,
      assetType: b.asset_type,
      assetCode: b.asset_code || undefined,
      assetIssuer: b.asset_issuer || undefined,
      limit: b.limit || undefined,
    }));

    return {
      publicKey: account.accountId(),
      balances,
      sequenceNumber: account.sequenceNumber(),
      numSubentries: (account as any).num_subentries,
      inflationDestination: (account as any).inflation_destination || undefined,
      homeDomain: (account as any).home_domain || undefined,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get account info: ${error.message}`);
    }
    throw new Error('Failed to get account info: Unknown error');
  }
}

export async function getBalance(
  publicKey: string,
  assetCode?: string
): Promise<AccountBalance[]> {
  try {
    const account = await getServer().loadAccount(publicKey);

    let balances: AccountBalance[] = account.balances.map((b: any) => ({
      balance: b.balance,
      assetType: b.asset_type,
      assetCode: b.asset_code || undefined,
      assetIssuer: b.asset_issuer || undefined,
      limit: b.limit || undefined,
    }));

    if (assetCode) {
      balances = balances.filter((b) => {
        if (assetCode.toUpperCase() === 'XLM') {
          return b.assetType === 'native';
        }
        return b.assetCode?.toUpperCase() === assetCode.toUpperCase();
      });
    }

    return balances;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
    throw new Error('Failed to get balance: Unknown error');
  }
}

export async function accountExists(publicKey: string): Promise<boolean> {
  try {
    await getServer().loadAccount(publicKey);
    return true;
  } catch (error) {
    return false;
  }
}
