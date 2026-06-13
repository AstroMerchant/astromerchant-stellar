import StellarSdk, { Horizon, Keypair, TransactionBuilder, Networks, Operation, Asset, BASE_FEE, Memo } from '@stellar/stellar-sdk';
import { config, getNetworkPassphrase } from '../config';

const server = new Horizon.Server(config.horizonUrl, {
  allowHttp: config.horizonUrl.startsWith('http://'),
});

export function getServer(): Horizon.Server {
  return server;
}

export function getNetwork(): { url: string; passphrase: string; isMainnet: boolean } {
  return {
    url: config.horizonUrl,
    passphrase: getNetworkPassphrase(),
    isMainnet: config.stellarNetwork.toUpperCase() === 'MAINNET',
  };
}

export {
  StellarSdk,
  Horizon,
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Memo,
};
