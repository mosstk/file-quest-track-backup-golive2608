
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { document_name, receiver_email, requester_id, file_path, status } = body;

    // ใช้ service role key สำหรับ mock users
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdmZveWZhYWloamt5c3lkYXBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTMwNDc0MywiZXhwIjoyMDYwODgwNzQzfQ.RvJJQ2OsApBUwqjb13BpGJqsAjqMXxvl0xEAzF4FTqU';
    
    const adminSupabase = createClient(
      'https://gqvfoyfaaihjkysydapc.supabase.co',
      serviceRoleKey
    );

    const { data, error } = await adminSupabase
      .from('requests')
      .insert([{
        document_name,
        receiver_email,
        requester_id,
        file_path,
        status: status || 'pending'
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
