import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  stellarNetwork: process.env.STELLAR_NETWORK || 'TESTNET',
  horizonUrl: process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org',
  merchantServerUrl: process.env.MERCHANT_SERVER_URL || 'http://localhost:4000',
  port: parseInt(process.env.PORT || '4001', 10),
  apiKey: process.env.API_KEY || 'astromerchant-internal-api-key',
};

export function isMainnet(): boolean {
  return config.stellarNetwork.toUpperCase() === 'MAINNET';
}

export function getNetworkPassphrase(): string {
  return isMainnet()
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015';
}
