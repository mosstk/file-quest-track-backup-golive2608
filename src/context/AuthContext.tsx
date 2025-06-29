
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  login: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
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
          role: data.role,
          avatar: data.avatar_url,
          avatar_url: data.avatar_url,
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const login = (role: UserRole) => {
    // ใช้ fixed UUID สำหรับ mock users เพื่อความเสถียร
    const mockUserIds = {
      'fa_admin': '11111111-1111-1111-1111-111111111111',
      'requester': '22222222-2222-2222-2222-222222222222',
      'receiver': '33333333-3333-3333-3333-333333333333'
    };

    const mockUserId = mockUserIds[role];
    const mockUser: User = {
      id: mockUserId,
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      full_name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `test-${role}@example.com`,
      employeeId: `EMP-${role.toUpperCase()}`,
      employee_id: `EMP-${role.toUpperCase()}`,
      company: 'TOA Group',
      department: 'Information Technology',
      division: 'Digital Solutions',
      role: role,
      avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${role}`,
      avatar_url: `https://api.dicebear.com/6.x/avataaars/svg?seed=${role}`,
    };
    
    // สร้าง profile ใน database สำหรับ mock user
    createMockProfile(mockUser);
    
    setUser(mockUser);
    toast.success(`เข้าสู่ระบบสำเร็จ: ${mockUser.name}`, {
      description: `บทบาท: ${role}`
    });
  };

  const createMockProfile = async (mockUser: User) => {
    try {
      console.log('Creating mock profile for user:', mockUser.id);
      
      // ตรวจสอบว่า profile มีอยู่แล้วหรือไม่
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', mockUser.id)
        .single();

      if (existingProfile) {
        console.log('Mock profile already exists, skipping creation');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .insert({
          id: mockUser.id,
          full_name: mockUser.full_name,
          avatar_url: mockUser.avatar_url,
          role: mockUser.role,
          employee_id: mockUser.employee_id,
          company: mockUser.company,
          department: mockUser.department,
          division: mockUser.division,
        });

      if (error) {
        console.error('Error creating mock profile:', error);
        // ไม่แสดง toast error เพื่อไม่ให้รบกวนผู้ใช้
        // mock user ยังคงใช้งานได้แม้ไม่มี profile ใน database
      } else {
        console.log('Mock profile created successfully');
      }
    } catch (error) {
      console.error('Error in createMockProfile:', error);
      // ไม่แสดง toast error เพื่อไม่ให้รบกวนผู้ใช้
    }
  };

  const logout = async () => {
    if (user && user.full_name?.startsWith('Test ')) {
      // ทำความสะอาด mock profile (ไม่บังคับ)
      try {
        console.log('Cleaning up mock profile for user:', user.id);
        
        await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);
          
        console.log('Mock profile cleaned up successfully');
      } catch (error) {
        console.error('Error cleaning up mock profile:', error);
        // ไม่แสดง error เพราะไม่สำคัญ
      }
      
      setUser(null);
      toast.success('ออกจากระบบเรียบร้อย');
      return;
    }
    
    return signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, login, logout }}>
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
