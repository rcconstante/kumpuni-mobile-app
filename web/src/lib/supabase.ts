import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Add them to web/.env.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUSINESS_IMAGES_BUCKET = 'business-images';
export const PAYMENT_PROOFS_BUCKET = 'payment-proofs';
