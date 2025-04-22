
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Use environment variables for Supabase URL and Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
