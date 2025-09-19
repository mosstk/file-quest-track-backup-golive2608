
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored admin session first
    const checkStoredAdminSession = () => {
      const storedAdminSession = localStorage.getItem('admin_session');
      if (storedAdminSession) {
        try {
          const { user: adminUser } = JSON.parse(storedAdminSession);
          console.log('Restoring admin session from localStorage');
          
          // Create a fresh mock session every time to avoid expiration
          const mockSession = {
            access_token: 'mock-admin-token-' + Date.now(),
            token_type: 'bearer',
            user: {
              id: adminUser.id,
              email: adminUser.email,
              aud: 'authenticated',
              role: 'authenticated',
              email_confirmed_at: new Date().toISOString(),
              phone: '',
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              app_metadata: { provider: 'mock' },
              user_metadata: { role: adminUser.role },
              identities: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            expires_in: 86400, // 24 hours
            expires_at: Math.floor(Date.now() / 1000) + 86400,
            refresh_token: 'mock-refresh-token-' + Date.now()
          };
          
          setSession(mockSession);
          setUser(adminUser);
          setLoading(false);
          return true;
        } catch (error) {
          console.error('Error parsing stored admin session:', error);
          localStorage.removeItem('admin_session');
        }
      }
      return false;
    };

    // Always check for admin session first - ignore Supabase auth state changes for admin
    if (checkStoredAdminSession()) {
      return; // Don't set up Supabase listeners if admin is logged in
    }

    // Set up auth state listener only for non-admin users
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email);
      
      // Always check if admin session exists first
      const hasAdminSession = localStorage.getItem('admin_session');
      if (hasAdminSession) {
        console.log('Admin session exists, ignoring Supabase auth change');
        return;
      }
      
      if (session?.user) {
        setSession(session);
        setTimeout(() => {
          fetchUserProfile(session.user.id, session.user.email);
        }, 0);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    // Check for existing Supabase session only if no admin session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const hasAdminSession = localStorage.getItem('admin_session');
      if (hasAdminSession) {
        return; // Don't process Supabase session if admin exists
      }
      
      if (session?.user) {
        setSession(session);
        fetchUserProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Add periodic check to ensure admin session stays active
  useEffect(() => {
    const adminSessionCheck = setInterval(() => {
      const storedAdminSession = localStorage.getItem('admin_session');
      if (storedAdminSession && !user) {
        console.log('Periodic admin session check - restoring session');
        try {
          const { user: adminUser } = JSON.parse(storedAdminSession);
          setUser(adminUser);
          
          const mockSession = {
            access_token: 'mock-admin-token-' + Date.now(),
            token_type: 'bearer',
            user: {
              id: adminUser.id,
              email: adminUser.email,
              aud: 'authenticated',
              role: 'authenticated',
              email_confirmed_at: new Date().toISOString(),
              phone: '',
              confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              app_metadata: { provider: 'mock' },
              user_metadata: { role: adminUser.role },
              identities: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            expires_in: 86400,
            expires_at: Math.floor(Date.now() / 1000) + 86400,
            refresh_token: 'mock-refresh-token-' + Date.now()
          };
          setSession(mockSession);
        } catch (error) {
          console.error('Error in periodic admin check:', error);
          localStorage.removeItem('admin_session');
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(adminSessionCheck);
  }, [user]);

  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log('Fetching profile for user:', userId, 'email:', userEmail);
      
      // Try to fetch by email first if available, then fallback to id
      let query = supabase.from('profiles').select('*');
      
      if (userEmail) {
        query = query.or(`email.eq.${userEmail},username.eq.${userEmail}`);
      } else {
        query = query.eq('id', userId);
      }
      
      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        // หาก error ให้ clear session เพื่อไม่ให้ loop
        setSession(null);
        setUser(null);
        return;
      }

      if (data) {
        console.log('Profile data:', data);
        // Type assertion to ensure role is treated as UserRole
        const userRole = data.role as UserRole;
        
        setUser({
          id: data.id,
          name: data.full_name || '',
          full_name: data.full_name || '',
          email: data.email || session?.user?.email || '',
          employeeId: data.employee_id || '',
          employee_id: data.employee_id || '',
          company: data.company || '',
          department: data.department || '',
          division: data.division || '',
          role: userRole,
          avatar: data.avatar_url,
          avatar_url: data.avatar_url,
        });
      } else {
        console.log('No profile found, clearing session');
        // ถ้าไม่เจอ profile ให้ clear session
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setSession(null);
      setUser(null);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // For testing purposes, automatically login as admin for admin panel access
      if (username === 'admin' && password === 'admin') {
        // สร้าง mock session สำหรับ admin ให้ Supabase RLS ทำงานได้
        const mockSession = {
          access_token: 'mock-admin-token',
          token_type: 'bearer',
          user: {
            id: '11111111-1111-1111-1111-111111111111',
            email: 'admin@toa.com',
            aud: 'authenticated',
            role: 'authenticated',
            email_confirmed_at: new Date().toISOString(),
            phone: '',
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            app_metadata: { provider: 'mock' },
            user_metadata: { role: 'fa_admin' },
            identities: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: 'mock-refresh-token'
        } as Session;

        const userObj: User = {
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
        
        // Set both session and user for proper auth state
        setSession(mockSession);
        setUser(userObj);
        
        // Store admin session in localStorage for persistence
        localStorage.setItem('admin_session', JSON.stringify({
          session: mockSession,
          user: userObj
        }));
        
        toast.success(`เข้าสู่ระบบสำเร็จ`, {
          description: `ยินดีต้อนรับ ${userObj.full_name}`
        });
        
        return;
      }
      
      // ใช้ Supabase Auth แทน custom authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username, // ใช้ username เป็น email
        password: password,
      });
      
      if (error) {
        // หากไม่สามารถ login ด้วย Supabase Auth ได้ ให้ fallback ไป custom auth
        console.log('Supabase auth failed, trying custom auth:', error.message);
        
        // Find user by username
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .eq('is_active', true)
          .single();
        
        if (profileError || !profile) {
          throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
        
        // Check password (using stored password)
        if (profile.password !== password) {
          throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
        
        // Create user object
        const userObj: User = {
          id: profile.id,
          name: profile.full_name || '',
          full_name: profile.full_name || '',
          email: profile.email || profile.username || '',
          employeeId: profile.employee_id || '',
          employee_id: profile.employee_id || '',
          company: profile.company || '',
          department: profile.department || '',
          division: profile.division || '',
          role: profile.role as UserRole,
          avatar: profile.avatar_url,
          avatar_url: profile.avatar_url,
        };
        
        setUser(userObj);
        
        toast.success(`เข้าสู่ระบบสำเร็จ`, {
          description: `ยินดีต้อนรับ ${profile.full_name}`
        });
        
        return;
      }
      
      // หาก Supabase Auth สำเร็จ จะมี session และ user profile จะถูกโหลดอัตโนมัติใน useEffect
      console.log('Supabase auth successful:', data.user?.email);
      
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'เข้าสู่ระบบไม่สำเร็จ');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.name || userData.full_name,
          avatar_url: userData.avatar || userData.avatar_url,
          role: userData.role,
        },
      },
    });

    if (signUpError) throw signUpError;
  };

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Clear admin session from localStorage
      localStorage.removeItem('admin_session');
      
      // Sign out from Supabase Auth if there's an active session
      await supabase.auth.signOut();
      
      toast.success('ออกจากระบบเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
