import { Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';
import { mockDb, Profile } from '../services/mockDb.js';
import { supabaseAdmin } from '../config/supabase.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendEmail } from '../config/resend.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['student', 'faculty', 'admin']).optional()
});

export async function login(req: AuthRequest, res: Response) {
  const { email, password, role } = loginSchema.parse(req.body);

  // 1. Try Supabase Auth if configured
  if (supabaseAdmin && !email.endsWith('@college.edu')) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (!error && data.session && data.user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        mockDb.logAudit('USER_LOGIN', 'PROFILE', profile.id, { email, provider: 'supabase' }, profile.id, profile.email);
        return res.json({
          token: data.session.access_token,
          user: profile
        });
      }
    }
  }

  // 2. Demo / Fallback local authentication
  let profile = mockDb.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

  if (!profile) {
    // If demo login with any role specified, create a transient profile
    profile = {
      id: uuidv4(),
      full_name: email.split('@')[0].toUpperCase(),
      email,
      role: role || 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockDb.profiles.push(profile);
  }

  // Generate JWT token
  const token = jwt.sign(
    { sub: profile.id, email: profile.email, role: profile.role },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  const mockToken = `mock-token-${profile.email}`;

  mockDb.logAudit('USER_LOGIN', 'PROFILE', profile.id, { email, role: profile.role }, profile.id, profile.email);

  return res.json({
    token: config.isSupabaseConfigured ? token : mockToken,
    user: profile
  });
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Fetch populated department/batch if present
  const dept = mockDb.departments.find((d) => d.id === req.user?.department_id);
  const batch = mockDb.batches.find((b) => b.id === req.user?.batch_id);

  return res.json({
    user: {
      ...req.user,
      department: dept ? dept.name : undefined,
      batch: batch ? batch.name : undefined
    }
  });
}

export async function forgotPassword(req: AuthRequest, res: Response) {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);

  const resetToken = uuidv4();
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request - Online Exam Management System',
    html: `
      <h2>OEMS Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `,
    text: `Password reset link: ${resetUrl}`
  });

  mockDb.logAudit('PASSWORD_RESET_REQUEST', 'PROFILE', undefined, { email });

  return res.json({
    message: 'Password reset email sent successfully.',
    resetUrlDemo: resetUrl
  });
}

export async function resetPassword(req: AuthRequest, res: Response) {
  const { email, newPassword } = z
    .object({
      email: z.string().email(),
      newPassword: z.string().min(6)
    })
    .parse(req.body);

  mockDb.logAudit('PASSWORD_RESET_COMPLETE', 'PROFILE', undefined, { email });

  return res.json({ message: 'Password reset completed successfully. You can now login.' });
}
