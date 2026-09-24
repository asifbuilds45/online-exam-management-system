import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { mockDb, Profile } from '../services/mockDb.js';
import { supabaseAdmin } from '../config/supabase.js';

export interface AuthRequest extends Request {
  user?: Profile;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Check if token is a local mock token
    if (token.startsWith('mock-token-')) {
      const email = token.replace('mock-token-', '');
      const profile = mockDb.profiles.find((p) => p.email === email);
      if (!profile) {
        return res.status(401).json({ error: 'User profile not found' });
      }
      req.user = profile;
      return next();
    }

    // 2. Try verifying standard JWT token
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      const profile = mockDb.profiles.find((p) => p.id === decoded.sub || p.email === decoded.email);
      if (profile) {
        req.user = profile;
        return next();
      }
    } catch (e) {
      // JWT verification failed, check Supabase auth if configured
    }

    // 3. Check Supabase Auth if configured
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data.user) {
        // Fetch profile
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          req.user = profile;
          return next();
        }
      }
    }

    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export function requireRole(...roles: Array<'student' | 'faculty' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User context missing' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Requires one of [${roles.join(', ')}] roles. Yours is '${req.user.role}'`
      });
    }

    next();
  };
}
