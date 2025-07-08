
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
  
  const mockAdminId = '11111111-1111-1111-1111-111111111111';
  
  try {
    // Call the edge function for admin deletion
    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
      body: {
        userId: userId,
        adminId: mockAdminId
      }
    });

    console.log('Edge function response:', { data, error });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`ไม่สามารถลบผู้ใช้งานได้: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'การลบผู้ใช้งานไม่สำเร็จ');
    }

    console.log('Successfully deleted user:', data.deletedUser);
    return data.deletedUser;
    
  } catch (error: any) {
    console.error('Delete operation failed:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('Unauthorized')) {
      throw new Error('ไม่มีสิทธิ์ในการลบผู้ใช้งาน');
    } else if (error.message.includes('not found')) {
      throw new Error('ไม่พบผู้ใช้งานที่ต้องการลบ');
    } else if (error.message.includes('Cannot delete admin')) {
      throw new Error('ไม่สามารถลบผู้ดูแลระบบได้');
    }
    
    throw new Error('เกิดข้อผิดพลาดในการลบผู้ใช้งาน');
  }
};
