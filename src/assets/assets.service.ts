import { getServer, Keypair, TransactionBuilder, Operation, Asset as StellarAsset, BASE_FEE, getNetwork } from '../stellar/client';
import type { AssetInfo, AccountBalance } from '../types';

const SUPPORTED_ASSETS: AssetInfo[] = [
  { code: 'XLM', issuer: '', type: 'native' },
  { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', type: 'credit_alphanum4' },
];

export function getSupportedAssets(): AssetInfo[] {
  return SUPPORTED_ASSETS;
}

export async function getAssetBalance(
  publicKey: string,
  assetCode: string
): Promise<string> {
  try {
    const account = await getServer().loadAccount(publicKey);

    if (assetCode.toUpperCase() === 'XLM') {
      const nativeBalance = account.balances.find(
        (b: any) => b.asset_type === 'native'
      );
      return nativeBalance ? nativeBalance.balance : '0';
    }

    const assetBalance = account.balances.find(
      (b: any) =>
        b.asset_code?.toUpperCase() === assetCode.toUpperCase()
    );
    return assetBalance ? assetBalance.balance : '0';
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get asset balance: ${error.message}`);
    }
    throw new Error('Failed to get asset balance: Unknown error');
  }
}

export async function checkTrustline(
  publicKey: string,
  assetCode: string,
  issuer: string
): Promise<boolean> {
  try {
    const account = await getServer().loadAccount(publicKey);

    if (assetCode.toUpperCase() === 'XLM') {
      return true;
    }

    const matchingBalance = account.balances.find(
      (b: any) =>
        b.asset_code?.toUpperCase() === assetCode.toUpperCase() &&
        b.asset_issuer === issuer
    );

    return !!matchingBalance;
  } catch (error) {
    return false;
  }
}

export async function establishTrustline(
  secretKey: string,
  assetCode: string,
  issuer: string
): Promise<{ success: boolean; message: string }> {
  try {
    const sourceKeypair = Keypair.fromSecret(secretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    const sourceAccount = await getServer().loadAccount(sourcePublicKey);

    const asset = new StellarAsset(assetCode, issuer);
    const { passphrase } = getNetwork();

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: passphrase,
    })
      .addOperation(
        Operation.changeTrust({
          asset,
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);

    await getServer().submitTransaction(transaction);

    return {
      success: true,
      message: `Trustline established for ${assetCode}`,
    };
  } catch (error: any) {
    const message = error?.response?.data?.extras?.result_codes
      ? JSON.stringify(error.response.data.extras.result_codes)
      : error instanceof Error
        ? error.message
        : 'Unknown error';
    return {
      success: false,
      message: `Failed to establish trustline: ${message}`,
    };
  }
}
