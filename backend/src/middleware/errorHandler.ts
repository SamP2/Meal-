import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Known application errors
  if (err instanceof AppError) {
    const body: Record<string, unknown> = { error: err.code, message: err.message };
    if (err.field) body.field = err.field;
    res.status(err.statusCode).json(body);
    return;
  }

  // Log unexpected errors server-side only — never leak stack to client
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' });
}
