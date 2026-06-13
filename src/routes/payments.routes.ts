import { Router, Request, Response } from 'express';
import {
  generatePaymentAddress,
  verifyTransaction,
  sendSettlement,
  watchIncomingPayments,
} from '../payments/payments.service';
import { getRecentTransactions } from '../transactions/transactions.service';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/generate-address', (req: Request, res: Response) => {
  try {
    const { merchantPublicKey, amount, assetCode } = req.body;

    if (!merchantPublicKey || !amount || !assetCode) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: merchantPublicKey, amount, assetCode',
      });
      return;
    }

    const result = generatePaymentAddress(merchantPublicKey, amount, assetCode);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate address',
    });
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { txHash } = req.body;

    if (!txHash) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: txHash',
      });
      return;
    }

    const result = await verifyTransaction(txHash);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify transaction',
    });
  }
});

router.post('/settle', async (req: Request, res: Response) => {
  try {
    const { destinationPublicKey, amount, assetCode, sourceSecretKey } = req.body;

    if (!destinationPublicKey || !amount || !assetCode || !sourceSecretKey) {
      res.status(400).json({
        success: false,
        error:
          'Missing required fields: destinationPublicKey, amount, assetCode, sourceSecretKey',
      });
      return;
    }

    const result = await sendSettlement(
      destinationPublicKey,
      amount,
      assetCode,
      sourceSecretKey
    );
    res.status(result.success ? 200 : 400).json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send settlement',
    });
  }
});

router.get('/incoming/:publicKey', async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.params;
    const transactions = await getRecentTransactions(publicKey, 20);
    const incoming = transactions.filter((tx) => tx.to === publicKey);
    res.status(200).json({
      success: true,
      data: incoming,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get incoming payments',
    });
  }
});

export default router;
