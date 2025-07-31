import { createClient } from '@supabase/supabase-js'

// These environment variables are set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Auth functionality will not work correctly.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
