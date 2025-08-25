// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

export const supabase = createClient(
  Constants.expoConfig!.extra!.SUPABASE_URL as string,
  Constants.expoConfig!.extra!.SUPABASE_ANON_KEY as string,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,   // el listener mantiene el user; no guardamos la sesión nativa
      detectSessionInUrl: false,
    },
  }
);
