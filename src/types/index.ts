export interface WalletInfo {
  publicKey: string;
  secretKey?: string;
  balance: string;
}

export interface PaymentRequest {
  amount: string;
  assetCode: string;
  destinationAddress: string;
  memo: string;
}

export interface PaymentVerification {
  verified: boolean;
  amount: string;
  asset: string;
  from: string;
  to: string;
  memo: string;
  txHash: string;
  timestamp: string;
}

export interface TransactionInfo {
  hash: string;
  type: string;
  amount: string;
  asset: string;
  from: string;
  to: string;
  memo: string;
  status: string;
  createdAt: string;
  ledger: number;
}

export interface AssetInfo {
  code: string;
  issuer: string;
  type: string;
}

export interface MerchantWallet {
  merchantId: string;
  publicKey: string;
  secretKey?: string;
  assets: AssetInfo[];
}

export interface AccountInfo {
  publicKey: string;
  balances: AccountBalance[];
  sequenceNumber: string;
  numSubentries: number;
  inflationDestination?: string;
  homeDomain?: string;
}

export interface AccountBalance {
  balance: string;
  assetType: string;
  assetCode?: string;
  assetIssuer?: string;
  limit?: string;
}

export interface PaymentOperation {
  id: string;
  type: string;
  amount: string;
  assetType: string;
  assetCode?: string;
  assetIssuer?: string;
  from: string;
  to: string;
  memo?: string;
  memoType?: string;
  transactionHash: string;
  createdAt: string;
  sourceAccount: string;
}

export interface SettlementResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface GeneratePaymentAddressResult {
  destinationAddress: string;
  memo: string;
}

export interface VerifyTransactionResult {
  verified: boolean;
  amount: string;
  asset: string;
  from: string;
  to: string;
  memo: string;
  txHash: string;
}
