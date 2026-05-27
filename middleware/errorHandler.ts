import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
    details: (err.issues || (err as any).errors || []).map((e: any) => ({
      path: e.path?.join?.('.') || 'unknown',
      message: e.message || 'Invalid value',
    })),
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
}
