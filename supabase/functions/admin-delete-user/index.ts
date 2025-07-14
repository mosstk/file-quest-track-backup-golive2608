import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { userId, adminId } = await req.json()

    console.log('Delete request:', { userId, adminId });

    if (!userId || !adminId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or adminId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify admin privileges
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single()

    console.log('Admin verification:', { adminProfile, adminError, adminId });

    if (adminError) {
      console.error('Admin verification error:', adminError);
      return new Response(
        JSON.stringify({ error: `Admin verification failed: ${adminError.message}` }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!adminProfile || adminProfile.role !== 'fa_admin') {
      console.error('Admin profile check failed:', { adminProfile, role: adminProfile?.role });
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin privileges required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Admin verification successful:', { adminId, role: adminProfile.role });

    // Check if user exists and get their info
    const { data: userToDelete, error: userCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', userId)
      .single()

    console.log('User to delete:', { userToDelete, userCheckError });

    if (userCheckError || !userToDelete) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prevent deleting admin users
    if (userToDelete.role === 'fa_admin') {
      return new Response(
        JSON.stringify({ error: 'Cannot delete admin users' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Delete the user using admin privileges (bypass RLS)
    const { data: deletedUser, error: deleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)
      .select()

    console.log('Delete result:', { deletedUser, deleteError });

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return new Response(
        JSON.stringify({ error: `Failed to delete user: ${deleteError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!deletedUser || deletedUser.length === 0) {
      return new Response(
        JSON.stringify({ error: 'User deletion failed - no rows affected' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Successfully deleted user:', deletedUser[0]);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedUser: deletedUser[0],
        message: 'User deleted successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})