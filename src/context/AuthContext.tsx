
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
  login: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
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
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
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

  const createTestUserIfNeeded = async (email: string, password: string, role: UserRole) => {
    try {
      // Try to sign up first (this will fail if user already exists)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
            role: role,
            employee_id: `EMP${role.toUpperCase()}001`,
            company: 'TOA Group',
            department: role === 'fa_admin' ? 'Finance' : role === 'requester' ? 'Operations' : 'Receiving',
            division: 'Bangkok'
          }
        }
      });

      if (signUpError && !signUpError.message.includes('User already registered')) {
        throw signUpError;
      }

      console.log('Test user created or already exists:', email);
      return true;
    } catch (error) {
      console.error('Error creating test user:', error);
      return false;
    }
  };

  const login = async (role: UserRole) => {
    try {
      setLoading(true);
      
      // Define test user credentials based on role
      const testUsers = {
        'fa_admin': { email: 'admin@toagroup.com', password: 'testpassword123' },
        'requester': { email: 'requester@toagroup.com', password: 'testpassword123' },
        'receiver': { email: 'receiver@toagroup.com', password: 'testpassword123' }
      };

      const credentials = testUsers[role];
      
      console.log(`Attempting to sign in as ${role} with email: ${credentials.email}`);
      
      // First try to login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      // If login fails with invalid credentials, try to create the user
      if (error && error.message.includes('Invalid login credentials')) {
        console.log('User not found, creating test user...');
        await createTestUserIfNeeded(credentials.email, credentials.password, role);
        
        // Wait a moment for the user to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to login again
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (retryError) {
          throw new Error(`ไม่สามารถเข้าสู่ระบบได้: ${retryError.message}`);
        }

        console.log('Login successful after creating user:', retryData);
      } else if (error) {
        throw new Error(`ไม่สามารถเข้าสู่ระบบได้: ${error.message}`);
      } else {
        console.log('Login successful:', data);
      }

      toast.success(`เข้าสู่ระบบสำเร็จ: ${role}`, {
        description: `ยินดีต้อนรับเข้าสู่ระบบ FileQuestTrack`
      });
      
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(`เข้าสู่ระบบไม่สำเร็จ: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
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
