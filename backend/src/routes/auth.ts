import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { RegisterBody, LoginBody } from '../types';

const router = Router();

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as RegisterBody;

  // Validate required fields
  if (!email || !password || !role) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      field: !email ? 'email' : !password ? 'password' : 'role',
      message: 'email, password, and role are required',
    });
    return;
  }

  // Validate role
  if (role !== 'student' && role !== 'mess_owner') {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      field: 'role',
      message: 'role must be "student" or "mess_owner"',
    });
    return;
  }

  // Validate password length (Requirement 1.3, 2.3)
  if (password.length < 8) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      field: 'password',
      message: 'Password must be at least 8 characters',
    });
    return;
  }

  // Create user via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },
    },
  });

  if (authError) {
    // Duplicate email or other Supabase error
    if (authError.message.toLowerCase().includes('already registered') ||
        authError.message.toLowerCase().includes('already exists') ||
        authError.status === 422) {
      res.status(400).json({
        error: 'DUPLICATE_EMAIL',
        message: 'An account with this email already exists',
      });
      return;
    }
    res.status(400).json({ error: 'REGISTRATION_ERROR', message: authError.message });
    return;
  }

  if (!authData.user) {
    res.status(400).json({ error: 'REGISTRATION_ERROR', message: 'Registration failed' });
    return;
  }

  // Insert profile row with role (upsert in case of re-registration)
  await supabase.from('profiles').upsert({ id: authData.user.id, role });

  // Email confirmation is enabled — session will be null until confirmed
  if (!authData.session) {
    res.status(201).json({
      message: 'Registration successful. Please check your email to confirm your account, then log in.',
      user: { id: authData.user.id, email: authData.user.email, role },
    });
    return;
  }

  res.status(201).json({
    session: authData.session,
    user: { id: authData.user.id, email: authData.user.email, role },
  });
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginBody;

  if (!email || !password) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'email and password are required',
    });
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    // Return opaque error — do not reveal which field failed (Requirement 1.5, 2.5)
    res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    return;
  }

  res.status(200).json({
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role,
    },
  });
});

export default router;
