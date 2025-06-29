
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
    // Step 1: Create auth user using regular signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: 'TempPass123!',
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
      console.error('Error creating auth user:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create auth user');
    }

    // Step 2: Wait for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Check if profile was created by the trigger
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    console.log('Profile check result:', { existingProfile, checkError });
    
    // Step 4: If profile doesn't exist, create it manually
    if (!existingProfile) {
      console.log('Creating profile manually...');
      const { data: newProfile, error: profileError } = await supabase
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
      
      console.log('Manual profile creation result:', { newProfile, profileError });
      
      if (profileError) {
        console.error('Error creating profile manually:', profileError);
        throw profileError;
      }
    } else {
      // Update existing profile with complete data
      console.log('Updating existing profile...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: userData.name,
          role: userData.role,
          employee_id: userData.employeeId,
          company: userData.company,
          department: userData.department,
          division: userData.division,
        })
        .eq('id', authData.user.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
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
