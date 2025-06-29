
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
    // Create a proper UUID for mock user instead of string
    const mockUserId = crypto.randomUUID();
    const mockUser: User = {
      id: mockUserId, // Use proper UUID
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      full_name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `test-${role}@example.com`,
      employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
      employee_id: `EMP-${Math.floor(Math.random() * 10000)}`,
      company: 'TOA Group',
      department: 'Information Technology',
      division: 'Digital Solutions',
      role: role,
      avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${role}`,
      avatar_url: `https://api.dicebear.com/6.x/avataaars/svg?seed=${role}`,
    };
    
    // Create a corresponding profile entry in the database for the mock user
    createMockProfile(mockUser);
    
    setUser(mockUser);
    toast.success(`Logged in as ${mockUser.name}`, {
      description: `Role: ${role}`
    });
  };

  const createMockProfile = async (mockUser: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
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
      }
    } catch (error) {
      console.error('Error in createMockProfile:', error);
    }
  };

  const logout = async () => {
    if (user && user.id.length === 36) { // Check if it's a proper UUID (mock user)
      // Clean up mock profile
      try {
        await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);
      } catch (error) {
        console.error('Error cleaning up mock profile:', error);
      }
      
      setUser(null);
      toast.success('Logged out successfully');
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
