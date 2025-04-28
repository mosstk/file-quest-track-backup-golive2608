
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Use environment variables for Supabase URL and Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdmZveWZhYWloamt5c3lkYXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDQ3NDMsImV4cCI6MjA2MDg4MDc0M30.YAGwxOnP-W9X2zdvSzzRACzP0Q108IMN9PjNlnAExkA'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anon Key is using default placeholder values. For production, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
