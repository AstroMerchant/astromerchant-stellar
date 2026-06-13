import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing x-api-key header',
    });
    return;
  }

  if (apiKey !== config.apiKey) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key',
    });
    return;
  }

  next();
}
