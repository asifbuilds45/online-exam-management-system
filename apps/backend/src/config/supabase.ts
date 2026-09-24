import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

export const supabaseAdmin = config.isSupabaseConfigured
  ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
