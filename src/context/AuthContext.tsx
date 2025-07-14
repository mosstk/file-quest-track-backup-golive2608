
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
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
    // Set up auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email);
      setSession(session);
      if (session?.user) {
        // Use setTimeout to prevent deadlock
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Then check for existing session  
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

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
          email: session?.user?.email || '',
          employeeId: data.employee_id || '',
          employee_id: data.employee_id || '',
          company: data.company || '',
          department: data.department || '',
          division: data.division || '',
          role: userRole,
          avatar: data.avatar_url,
          avatar_url: data.avatar_url,
        });
        
        // Redirect to dashboard after successful profile fetch
        if (window.location.pathname === '/') {
          window.location.href = '/dashboard';
        }
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
        
        setUser(userObj);
        
        toast.success(`เข้าสู่ระบบสำเร็จ`, {
          description: `ยินดีต้อนรับ ${userObj.full_name}`
        });
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
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
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
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
