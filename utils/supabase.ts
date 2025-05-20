import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anonymous Key is missing. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SupplementDelivery = {
  id: number;
  created_at?: string;
  name: string;
  email: string;
  address: string;
  supplement_name: string;
  quantity: number;
  delivery_status: string;
  tracking_number?: string;
  notes?: string;
}