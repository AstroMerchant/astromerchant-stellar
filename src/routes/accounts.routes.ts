import { Router, Request, Response } from 'express';
import {
  createMerchantWallet,
  getAccountInfo,
  getBalance,
} from '../accounts/accounts.service';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/create', async (req: Request, res: Response) => {
  try {
    const wallet = await createMerchantWallet();
    res.status(201).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create wallet',
    });
  }
});

router.get('/:publicKey', async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.params;
    const info = await getAccountInfo(publicKey);
    res.status(200).json({
      success: true,
      data: info,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get account info',
    });
  }
});

router.get('/:publicKey/balance', async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.params;
    const assetCode = req.query.asset as string | undefined;
    const balance = await getBalance(publicKey, assetCode);
    res.status(200).json({
      success: true,
      data: balance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get balance',
    });
  }
});

export default router;
