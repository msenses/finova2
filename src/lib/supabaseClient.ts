import { createClient } from '@supabase/supabase-js';

// Build ortamında env yoksa Supabase client oluştururken hata vermesin diye
// boş değerler yerine geçerli formatta dummy değerler kullanıyoruz.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || 'https://example.supabase.co';
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || 'dummy-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase env değişkenleri eksik: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


