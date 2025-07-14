
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
    email: profile.email || '',
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
    // Check if username or employee_id already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('username, employee_id')
      .or(`username.eq.${userData.username},employee_id.eq.${userData.employeeId}`)
      .limit(1);
    
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      throw checkError;
    }
    
    if (existingUser && existingUser.length > 0) {
      const existing = existingUser[0];
      if (existing.username === userData.username) {
        throw new Error('อีเมลผู้ใช้งานนี้มีอยู่แล้วในระบบ');
      }
      if (existing.employee_id === userData.employeeId) {
        throw new Error('รหัสพนักงานนี้มีอยู่แล้วในระบบ');
      }
    }
    
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
        email: userData.username, // เก็บอีเมลในฟิลด์ email ด้วย
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
    
    // Handle specific database constraint errors
    if (error.message?.includes('duplicate key value violates unique constraint')) {
      if (error.message.includes('profiles_username_key')) {
        throw new Error('อีเมลผู้ใช้งานนี้มีอยู่แล้วในระบบ');
      } else if (error.message.includes('profiles_employee_id_key')) {
        throw new Error('รหัสพนักงานนี้มีอยู่แล้วในระบบ');
      } else {
        throw new Error('ข้อมูลที่กรอกซ้ำกับที่มีอยู่ในระบบแล้ว');
      }
    }
    
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
  // Don't update username to prevent duplicate key constraints
  // Username should be immutable once set
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: userData.name,
      // username: userData.username, // Remove this to prevent duplicate key errors
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
  console.log('Attempting to delete user using Edge Function:', userId);
  
  try {
    // Get current user info
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser?.user?.id) {
      throw new Error('ไม่สามารถตรวจสอบตัวตนได้');
    }

    console.log('Current user ID:', currentUser.user.id);

    // Use Edge Function for deletion with service role privileges
    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
      body: {
        userId: userId,
        adminId: currentUser.user.id
      }
    });
    
    console.log('Edge Function result:', { data, error });
    
    if (error) {
      console.error('Edge Function failed:', error);
      throw new Error(`ไม่สามารถลบผู้ใช้งานได้: ${error.message}`);
    }

    if (data?.error) {
      throw new Error(`ไม่สามารถลบผู้ใช้งานได้: ${data.error}`);
    }

    if (!data?.success) {
      throw new Error('ไม่สามารถลบผู้ใช้งานได้');
    }

    console.log('Successfully deleted user via Edge Function:', userId);
    return { success: true };
    
  } catch (error: any) {
    console.error('Delete operation failed:', error);
    throw error;
  }
};
