import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

interface SupabaseUser {
  id: string;
  user_metadata?: {
    role?: UserRole;
  };
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    // Use Supabase client to verify the token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
      return;
    }

    const id = user.id;
    const role = (user as SupabaseUser).user_metadata?.role;

    if (!id || !role) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid token claims' });
      return;
    }

    req.user = { id, role };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
}
