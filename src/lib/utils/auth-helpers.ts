
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const validateUserSession = async (userId: string): Promise<boolean> => {
  try {
    console.log('Validating user session for ID:', userId);
    
    // ตรวจสอบว่า user มี profile ใน database หรือไม่
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error validating user session:', error);
      return false;
    }

    console.log('User validation successful:', data);
    return !!data;
  } catch (error) {
    console.error('Error in validateUserSession:', error);
    return false;
  }
};


export const sanitizeUserData = (user: User): Partial<User> => {
  return {
    id: user.id,
    name: user.name || user.full_name,
    full_name: user.full_name || user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId || user.employee_id,
    employee_id: user.employee_id || user.employeeId,
    company: user.company,
    department: user.department,
    division: user.division,
    avatar: user.avatar || user.avatar_url,
    avatar_url: user.avatar_url || user.avatar,
  };
};
