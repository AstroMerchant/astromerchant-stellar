# AstroMerchant Stellar

The blockchain integration layer for the AstroMerchant payment gateway. Handles all interactions with the Stellar network.

## Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **SDK:** @stellar/stellar-sdk (Soroban)
- **API:** Horizon
- **Server:** Express

## Modules

```
src/
├── accounts      # Wallet creation, account info, balances
├── payments      # Address generation, verification, settlement
├── transactions  # Transaction fetching and decoding
├── assets        # Supported assets, trustline management
├── horizon       # Horizon API wrapper
├── listeners     # Real-time payment streaming
├── services      # Merchant wallet sync
├── routes        # Express route handlers
├── middleware     # API key authentication
└── stellar       # Stellar SDK client setup
```

## Key Functions

- `createMerchantWallet()` — Generate and fund Stellar keypair
- `generatePaymentAddress()` — Create memo-based payment address
- `watchIncomingPayments()` — Stream and verify incoming transactions
- `verifyTransaction()` — Validate transaction on Stellar network
- `sendSettlement()` — Submit settlement transactions
- `establishTrustline()` — Manage non-native asset trustlines

## Getting Started

```bash
npm install
npm run start:dev
```

## Environment

```env
STELLAR_NETWORK=TESTNET
HORIZON_URL=https://horizon-testnet.stellar.org
MERCHANT_SERVER_URL=http://localhost:4000
PORT=4001
API_KEY=your-internal-api-key
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/accounts/create` | Create merchant wallet |
| GET | `/api/v1/accounts/:publicKey` | Get account info |
| GET | `/api/v1/accounts/:publicKey/balance` | Get balance |
| POST | `/api/v1/payments/generate-address` | Generate payment address |
| POST | `/api/v1/payments/verify` | Verify transaction |
| POST | `/api/v1/payments/settle` | Send settlement |
| GET | `/api/v1/payments/incoming/:publicKey` | Recent incoming payments |
| GET | `/api/v1/transactions/:hash` | Transaction details |
| GET | `/api/v1/transactions/:publicKey/recent` | Recent transactions |
