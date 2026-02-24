// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _supabase: AnyClient = null;

export async function getSupabaseClient(): Promise<AnyClient> {
  if (!isSupabaseConfigured) return null;
  if (_supabase) return _supabase;
  const { createClient } = await import('@supabase/supabase-js');
  _supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return _supabase;
}
