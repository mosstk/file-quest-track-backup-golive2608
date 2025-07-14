
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
  username: string;
  password: string;
  employeeId: string;
  company: string;
  department: string;
  division: string;
  role: 'fa_admin' | 'requester' | 'receiver';
}) => {
  console.log('Creating user with data:', userData);
  
  try {
    // Generate unique ID for the new user
    const userId = crypto.randomUUID();
    
    // Create profile directly in profiles table
    console.log('Creating profile...');
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: userData.name,
        username: userData.username,
        password: userData.password, // In real app, this should be hashed
        role: userData.role,
        employee_id: userData.employeeId,
        company: userData.company,
        department: userData.department,
        division: userData.division,
        is_active: true
      })
      .select()
      .single();
    
    console.log('Profile creation result:', { newProfile, profileError });
    
    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw profileError;
    }

    console.log('User created successfully');
    return { id: userId };
    
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
  username: string;
  employeeId: string;
  company: string;
  department: string;
  division: string;
  role: 'fa_admin' | 'requester' | 'receiver';
  isActive: boolean;
}) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: userData.name,
      username: userData.username,
      employee_id: userData.employeeId,
      company: userData.company,
      department: userData.department,
      division: userData.division,
      role: userData.role,
      is_active: userData.isActive,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  console.log('Attempting to delete user:', userId);
  
  try {
    // First, let's try direct deletion using service role approach
    // This should work since we have admin privileges in RLS
    console.log('Attempting direct deletion...');
    
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
      .select();
      
    console.log('Direct deletion result:', { data, error });
    
    if (error) {
      console.error('Direct deletion failed:', error);
      
      // Fallback: Try using edge function
      console.log('Trying edge function fallback...');
      const adminId = '11111111-1111-1111-1111-111111111111'; // Mock admin ID
      
      const { data: funcData, error: funcError } = await supabase.functions.invoke('admin-delete-user', {
        body: { 
          userId,
          adminId
        }
      });

      console.log('Edge function response:', { funcData, funcError });

      if (funcError || funcData?.error) {
        throw new Error(funcData?.error || funcError?.message || 'ไม่สามารถลบผู้ใช้งานได้');
      }
      
      if (!funcData?.success) {
        throw new Error('การลบผู้ใช้งานไม่สำเร็จ');
      }
    }

    console.log('Successfully deleted user:', userId);
    return { success: true };
    
  } catch (error: any) {
    console.error('Delete operation failed:', error);
    throw error; // Re-throw the original error to preserve the message
  }
};
