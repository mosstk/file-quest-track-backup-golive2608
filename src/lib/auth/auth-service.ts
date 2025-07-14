import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserService } from './user-service';
import type { AuthUser, UserRole, LoginCredentials, SignUpData } from './types';

export class AuthService {
  /**
   * Admin test login
   */
  static async adminTestLogin(): Promise<AuthUser> {
    const userObj: AuthUser = {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'TOA Admin',
      full_name: 'TOA Admin',
      email: 'admin@toa.com',
      employeeId: 'EMP-ADMIN-001',
      employee_id: 'EMP-ADMIN-001',
      company: 'TOA Group',
      department: 'Information Technology',
      division: 'Digital Solutions',
      role: 'fa_admin' as UserRole,
      avatar: '',
      avatar_url: '',
    };

    toast.success('เข้าสู่ระบบสำเร็จ', {
      description: `ยินดีต้อนรับ ${userObj.full_name}`
    });

    return userObj;
  }

  /**
   * Supabase Auth login
   */
  static async supabaseLogin(credentials: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.username,
      password: credentials.password,
    });

    if (error) {
      throw error;
    }

    console.log('Supabase auth successful:', data.user?.email);
    return data;
  }

  /**
   * Custom auth login (fallback)
   */
  static async customLogin(credentials: LoginCredentials): Promise<AuthUser> {
    // Find user by username
    const profile = await UserService.findUserByUsername(credentials.username);
    
    if (!profile) {
      throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    // Check password
    if (!UserService.validatePassword(profile.password, credentials.password)) {
      throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    const user = UserService.createUserFromProfile(profile);

    toast.success('เข้าสู่ระบบสำเร็จ', {
      description: `ยินดีต้อนรับ ${profile.full_name}`
    });

    return user;
  }

  /**
   * หลักใน login method
   */
  static async signIn(credentials: LoginCredentials): Promise<{ user?: AuthUser; requiresProfileFetch?: boolean }> {
    try {
      // Admin test login
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        const user = await this.adminTestLogin();
        return { user };
      }

      // Try Supabase Auth first
      try {
        await this.supabaseLogin(credentials);
        // If successful, profile will be fetched by auth state change
        return { requiresProfileFetch: true };
      } catch (supabaseError) {
        console.log('Supabase auth failed, trying custom auth:', (supabaseError as Error).message);
        
        // Fallback to custom auth
        const user = await this.customLogin(credentials);
        return { user };
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'เข้าสู่ระบบไม่สำเร็จ');
      throw error;
    }
  }

  /**
   * Sign up with Supabase
   */
  static async signUp(signUpData: SignUpData) {
    const { error, data } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        data: {
          full_name: signUpData.userData.name || signUpData.userData.full_name,
          avatar_url: signUpData.userData.avatar || signUpData.userData.avatar_url,
          role: signUpData.userData.role,
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Sign out
   */
  static async signOut() {
    await supabase.auth.signOut();
    toast.success('ออกจากระบบเรียบร้อยแล้ว');
  }
}