
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gqvfoyfaaihjkysydapc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdmZveWZhYWloamt5c3lkYXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDQ3NDMsImV4cCI6MjA2MDg4MDc0M30.YAGwxOnP-W9X2zdvSzzRACzP0Q108IMN9PjNlnAExkA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
