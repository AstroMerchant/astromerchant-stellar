import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import { config } from './config';

import accountsRoutes from './routes/accounts.routes';
import paymentsRoutes from './routes/payments.routes';
import transactionsRoutes from './routes/transactions.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    network: config.stellarNetwork,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/accounts', accountsRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/transactions', transactionsRoutes);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
);

app.listen(config.port, () => {
  console.log(`AstroMerchant Stellar service started on port ${config.port}`);
  console.log(`Network: ${config.stellarNetwork}`);
  console.log(`Horizon URL: ${config.horizonUrl}`);
});

export default app;
