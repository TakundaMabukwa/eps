import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function createSupabaseClient() {
  return supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null
}

export { createSupabaseClient as createClient }

export { createClient }