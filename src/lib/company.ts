import { supabase } from '@/lib/supabaseClient';

export async function fetchCurrentCompanyId(): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('company_id')
    .single();
  if (error) {
    return null;
  }
  return (data as any)?.company_id ?? null;
}


