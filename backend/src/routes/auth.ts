import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabase';
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

// ─── Fast2SMS OTP helpers ─────────────────────────────────────────────────────

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpViaSms(phone10digit: string, otp: string): Promise<{ ok: boolean; error?: string }> {
  // ── Provider 1: 2factor.in (preferred — free, no verification needed) ──
  const twoFactorKey = process.env.TWOFACTOR_API_KEY;
  if (twoFactorKey) {
    try {
      const url = `https://2factor.in/API/V1/${twoFactorKey}/SMS/${phone10digit}/${otp}/OTP1`;
      const res = await fetch(url);
      const json = await res.json() as any;
      console.log('📨 2factor.in response:', json);
      if (json.Status === 'Success') {
        return { ok: true };
      }
      console.warn('⚠️  2factor.in failed:', json.Details);
      // Fall through to Fast2SMS
    } catch (err: any) {
      console.error('❌ 2factor.in fetch error:', err.message);
      // Fall through to Fast2SMS
    }
  }

  // ── Provider 2: Fast2SMS (fallback) ──
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&variables_values=${otp}&route=otp&numbers=${phone10digit}`;
      const res = await fetch(url);
      const json = await res.json() as any;
      console.log('📨 Fast2SMS response:', json);
      if (json.return === true) {
        return { ok: true };
      }
      return { ok: false, error: json.message || 'Fast2SMS delivery failed' };
    } catch (err: any) {
      console.error('❌ Fast2SMS fetch error:', err.message);
      return { ok: false, error: err.message };
    }
  }

  return { ok: false, error: 'No SMS provider configured (set TWOFACTOR_API_KEY or FAST2SMS_API_KEY)' };
}

// POST /auth/phone/send-otp — Generate OTP, store in DB, send via Fast2SMS
router.post('/phone/send-otp', async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body as { phone: string };

  if (!phone) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'phone is required' });
    return;
  }

  // Normalize to 10-digit (Fast2SMS) and E.164 (+91...) formats
  const digits10 = phone.replace(/\D/g, '').slice(-10);
  const normalized = `+91${digits10}`;

  if (digits10.length !== 10) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Enter a valid 10-digit Indian mobile number' });
    return;
  }

  console.log(`📱 Sending OTP to: ${normalized}`);

  // Delete any existing unused OTPs for this number
  await supabaseAdmin.from('phone_otps').delete().eq('phone', normalized).eq('used', false);

  // Generate and store new OTP
  const otp = generateOtp();
  const { error: insertError } = await supabaseAdmin.from('phone_otps').insert({
    phone: normalized,
    otp,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
  });

  if (insertError) {
    console.error('❌ OTP insert error:', insertError);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Could not generate OTP' });
    return;
  }

  // Send via Fast2SMS
  const smsResult = await sendOtpViaSms(digits10, otp);

  if (!smsResult.ok) {
    // In dev mode, still return success and log the OTP so you can test
    console.log(`🔑 DEV OTP for ${normalized}: ${otp} (SMS failed: ${smsResult.error})`);
    if (process.env.NODE_ENV !== 'production') {
      res.json({
        message: 'OTP generated (SMS delivery failed — check server logs for OTP in dev mode)',
        phone: normalized,
        dev_otp: otp, // Remove this in production
      });
      return;
    }
    res.status(503).json({ error: 'SMS_ERROR', message: 'Could not send OTP SMS. Please try again.' });
    return;
  }

  console.log(`✅ OTP sent to ${normalized}`);
  res.json({ message: 'OTP sent successfully', phone: normalized });
});

// POST /auth/phone/verify-otp — Verify OTP, create/login Supabase user
router.post('/phone/verify-otp', async (req: Request, res: Response): Promise<void> => {
  const { phone, token } = req.body as { phone: string; token: string };

  if (!phone || !token) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'phone and token are required' });
    return;
  }

  const normalized = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;

  console.log(`🔐 Verifying OTP for: ${normalized}`);

  // Look up the OTP in our DB
  const { data: otpRow, error: otpError } = await supabaseAdmin
    .from('phone_otps')
    .select('*')
    .eq('phone', normalized)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (otpError || !otpRow) {
    console.error('❌ OTP lookup failed:', otpError?.message);
    res.status(401).json({ error: 'INVALID_OTP', message: 'OTP expired or not found. Please request a new one.' });
    return;
  }

  if (otpRow.otp !== token.trim()) {
    console.error('❌ OTP mismatch for', normalized);
    res.status(401).json({ error: 'INVALID_OTP', message: 'Incorrect OTP. Please try again.' });
    return;
  }

  // Mark OTP as used
  await supabaseAdmin.from('phone_otps').update({ used: true }).eq('id', otpRow.id);

  // Find or create Supabase user for this phone number
  // Use a deterministic email derived from phone so we can use email/password auth
  const phoneEmail = `${normalized.replace('+', '')}@phone.messfinder.app`;
  const phonePassword = `ph_${normalized.replace('+', '')}_secure_2024`;

  // Try to sign in first (returning user)
  let session: any = null;
  let userId: string = '';

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: phoneEmail,
    password: phonePassword,
  });

  if (!signInError && signInData.session) {
    session = signInData.session;
    userId = signInData.user.id;
    console.log(`✅ Existing phone user signed in: ${userId}`);
  } else {
    // New user — create account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: phoneEmail,
      password: phonePassword,
      options: { data: { role: 'mess_owner', phone: normalized } },
    });

    if (signUpError || !signUpData.user) {
      console.error('❌ Phone user creation failed:', signUpError?.message);
      res.status(500).json({ error: 'AUTH_ERROR', message: 'Could not create account. Please try again.' });
      return;
    }

    // If email confirmation is required, sign in with admin to get session
    if (!signUpData.session) {
      // Confirm email via admin and sign in
      await supabaseAdmin.auth.admin.updateUserById(signUpData.user.id, { email_confirm: true });
      const { data: retrySignIn } = await supabase.auth.signInWithPassword({
        email: phoneEmail,
        password: phonePassword,
      });
      session = retrySignIn?.session;
      userId = signUpData.user.id;
    } else {
      session = signUpData.session;
      userId = signUpData.user.id;
    }
    console.log(`✅ New phone user created: ${userId}`);
  }

  if (!session) {
    res.status(500).json({ error: 'AUTH_ERROR', message: 'Could not establish session. Please try again.' });
    return;
  }

  // Ensure profile exists with mess_owner role and phone
  await supabaseAdmin.from('profiles').upsert({
    id:    userId,
    role:  'mess_owner',
    phone: normalized,
  });

  res.json({
    session,
    user: {
      id:    userId,
      phone: normalized,
      email: null,
      role:  'mess_owner',
    },
  });
});

// POST /auth/phone/link-email — Link email+password to an existing phone-auth account
router.post('/phone/link-email', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Bearer token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'email and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' });
    return;
  }

  // Get user from token
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid token' });
    return;
  }

  // Update user with email and password using admin client
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email: email.trim(),
    password,
    email_confirm: true,
  });

  if (error) {
    console.error('Link email error:', error);
    res.status(400).json({ error: 'LINK_ERROR', message: error.message });
    return;
  }

  res.json({ message: 'Email linked successfully', user: { id: data.user.id, email: data.user.email } });
});

export default router;
