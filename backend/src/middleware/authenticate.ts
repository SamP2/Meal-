import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

interface SupabaseTokenPayload {
  sub: string;
  user_metadata?: {
    role?: UserRole;
  };
  [key: string]: unknown;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.SUPABASE_JWT_SECRET;

  if (!secret) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'JWT secret not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as SupabaseTokenPayload;

    const id = decoded.sub;
    const role = decoded.user_metadata?.role;

    if (!id || !role) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid token claims' });
      return;
    }

    req.user = { id, role };
    next();
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
}
