import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient role for this operation' });
      return;
    }

    next();
  };
}
