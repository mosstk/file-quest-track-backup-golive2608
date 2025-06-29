
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const fetchAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  return data.map(profile => ({
    id: profile.id,
    name: profile.full_name || '',
    email: '', // We'll need to get this separately or store in profiles
    employeeId: profile.employee_id || '',
    company: profile.company || '',
    department: profile.department || '',
    division: profile.division || '',
    role: profile.role as 'fa_admin' | 'requester' | 'receiver',
  })) as User[];
};

export const createUser = async (userData: {
  name: string;
  email: string;
  employeeId: string;
  company: string;
  department: string;
  division: string;
  role: 'fa_admin' | 'requester' | 'receiver';
}) => {
  console.log('Creating user with data:', userData);
  
  try {
    // Step 1: Create auth user via admin function
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: 'TempPass123!',
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: userData.name,
        role: userData.role,
        employee_id: userData.employeeId,
        company: userData.company,
        department: userData.department,
        division: userData.division,
      }
    });

    console.log('Auth admin createUser result:', { authData, authError });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create auth user');
    }

    // Step 2: The trigger should create the profile automatically
    // Let's wait a bit and then verify
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    console.log('Profile verification result:', { profile, profileError });
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error verifying profile:', profileError);
      throw profileError;
    }

    // If profile doesn't exist, create it manually
    if (!profile) {
      console.log('Creating profile manually...');
      const { data: manualProfile, error: manualError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: userData.name,
          role: userData.role,
          employee_id: userData.employeeId,
          company: userData.company,
          department: userData.department,
          division: userData.division,
        })
        .select()
        .single();
      
      console.log('Manual profile creation result:', { manualProfile, manualError });
      
      if (manualError) {
        console.error('Error creating profile manually:', manualError);
        throw manualError;
      }
    }

    return authData.user;
  } catch (error) {
    console.error('Full error in createUser:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: {
  name: string;
  employeeId: string;
  company: string;
  department: string;
  division: string;
  role: 'fa_admin' | 'requester' | 'receiver';
}) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: userData.name,
      employee_id: userData.employeeId,
      company: userData.company,
      department: userData.department,
      division: userData.division,
      role: userData.role,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  // We can only delete the profile, not the auth user without admin privileges
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};
