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
    // Check if we're connected to Supabase
    const { data: healthCheck } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (!healthCheck) {
      throw new Error('Cannot connect to Supabase database');
    }

    // Step 1: Create auth user with retry logic
    let authData, authError;
    let retries = 3;
    
    while (retries > 0) {
      console.log(`Attempting to create auth user (${4 - retries}/3)...`);
      
      const result = await supabase.auth.signUp({
        email: userData.email,
        password: 'TempPass123!', // Temporary password
        options: {
          emailRedirectTo: `${window.location.origin}/`,
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
      
      authData = result.data;
      authError = result.error;
      
      if (!authError) break;
      
      console.warn(`Auth signup attempt failed:`, authError);
      retries--;
      
      if (retries > 0) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('Auth signup result:', { authData, authError });

    if (authError) {
      console.error('Error creating auth user after retries:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create auth user - no user returned');
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Step 2: Wait for trigger to potentially create the profile
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Force create/update the profile directly
    console.log('Creating/updating profile...');
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
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
    
    console.log('Profile upsert result:', { newProfile, profileError });
    
    if (profileError) {
      console.error('Error creating/updating profile:', profileError);
      // Try to cleanup auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.warn('Failed to cleanup auth user:', cleanupError);
      }
      throw profileError;
    }

    console.log('User created successfully with profile:', newProfile);
    return authData.user;
    
  } catch (error: any) {
    console.error('Full error in createUser:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    } else if (error.message?.includes('User already registered')) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
    } else if (error.message?.includes('Invalid email')) {
      throw new Error('รูปแบบอีเมลไม่ถูกต้อง');
    } else {
      throw error;
    }
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
