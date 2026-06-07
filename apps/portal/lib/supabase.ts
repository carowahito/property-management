import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — avoids createClient running at module load time (build phase)
let _supabaseAdmin: SupabaseClient | null = null
let _supabaseAuth: SupabaseClient | null = null

function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
}

// Admin client — uses service role key, needed for auth.admin.createUser etc.
export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin
  const url = getUrl()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('Supabase service role env vars are not configured')
  _supabaseAdmin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  return _supabaseAdmin
}

// Auth client — uses anon key, sufficient for signInWithPassword
export function getSupabaseAuth(): SupabaseClient {
  if (_supabaseAuth) return _supabaseAuth
  const url = getUrl()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase anon key env vars are not configured')
  _supabaseAuth = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  return _supabaseAuth
}

// Named exports kept for backwards compatibility with existing imports
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop]
  },
})

export const supabaseAuth = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAuth() as any)[prop]
  },
})
