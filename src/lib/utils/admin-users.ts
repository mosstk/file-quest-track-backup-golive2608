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
    // Use regular signup with all metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: 'TempPass123!', // Temporary password - user should change this
      options: {
        data: {
          full_name: userData.name,
          role: userData.role,
          employee_id: userData.employeeId,
          company: userData.company,
          department: userData.department,
          division: userData.division,
        }
      }
    });

    console.log('Auth signup result:', { authData, authError });

    if (authError) {
      console.error('Error creating user:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // Wait for trigger to complete and verify profile was created
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify the profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    console.log('Profile verification:', { profile, profileError });
    
    if (profileError || !profile) {
      console.log('Profile not created by trigger, creating manually...');
      // If trigger didn't work, create profile manually
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: userData.name,
          role: userData.role,
          employee_id: userData.employeeId,
          company: userData.company,
          department: userData.department,
          division: userData.division,
        });
      
      if (insertError) {
        console.error('Error creating profile manually:', insertError);
        throw insertError;
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
