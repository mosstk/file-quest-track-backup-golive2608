import { supabase } from '@/integrations/supabase/client';
import type { AuthUser, UserRole } from './types';

export class UserService {
  /**
   * ดึงข้อมูล user profile จาก database
   */
  static async fetchUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) {
        console.log('No profile found for user:', userId);
        return null;
      }

      console.log('Profile data:', data);
      
      return {
        id: data.id,
        name: data.full_name || '',
        full_name: data.full_name || '',
        email: data.email || '',
        employeeId: data.employee_id || '',
        employee_id: data.employee_id || '',
        company: data.company || '',
        department: data.department || '',
        division: data.division || '',
        role: data.role as UserRole,
        avatar: data.avatar_url,
        avatar_url: data.avatar_url,
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }

  /**
   * ค้นหา user จาก username/email
   */
  static async findUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * ตรวจสอบรหัสผ่าน
   */
  static validatePassword(storedPassword: string, inputPassword: string): boolean {
    return storedPassword === inputPassword;
  }

  /**
   * สร้าง user object จาก profile data
   */
  static createUserFromProfile(profile: any, email?: string): AuthUser {
    return {
      id: profile.id,
      name: profile.full_name || '',
      full_name: profile.full_name || '',
      email: email || profile.email || profile.username || '',
      employeeId: profile.employee_id || '',
      employee_id: profile.employee_id || '',
      company: profile.company || '',
      department: profile.department || '',
      division: profile.division || '',
      role: profile.role as UserRole,
      avatar: profile.avatar_url,
      avatar_url: profile.avatar_url,
    };
  }
}