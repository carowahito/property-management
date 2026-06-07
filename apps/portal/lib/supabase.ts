import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — avoids createClient running at module load time (build phase)
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Supabase env vars are not configured')
  _supabaseAdmin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  return _supabaseAdmin
}

// Named export kept for backwards compatibility with existing imports
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop]
  },
})
