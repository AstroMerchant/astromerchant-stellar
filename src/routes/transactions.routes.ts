import { Router, Request, Response } from 'express';
import {
  getTransaction,
  getRecentTransactions,
  isTransactionSuccessful,
} from '../transactions/transactions.service';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/:hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    const tx = await getTransaction(hash);
    res.status(200).json({
      success: true,
      data: tx,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get transaction',
    });
  }
});

router.get('/:publicKey/recent', async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const transactions = await getRecentTransactions(publicKey, limit);
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recent transactions',
    });
  }
});

export default router;
