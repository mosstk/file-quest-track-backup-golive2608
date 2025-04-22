
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  // Add the missing methods
  login: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and get user profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
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
        email: session?.user?.email || '',
        employeeId: data.employee_id || '',
        company: data.company || '',
        department: data.department || '',
        division: data.division || '',
        role: data.role,
        avatar: data.avatar_url,
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
          full_name: userData.name,
          avatar_url: userData.avatar,
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

  // Add login function for demo purposes
  const login = (role: UserRole) => {
    // For development/demo purposes only - create a mock user
    const mockUser: User = {
      id: `mock-${role}-id`,
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `test-${role}@example.com`,
      employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
      company: 'TOA Group',
      department: 'Information Technology',
      division: 'Digital Solutions',
      role: role,
      avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${role}`,
    };
    setUser(mockUser);
    toast.success(`Logged in as ${mockUser.name}`, {
      description: `Role: ${role}`
    });
  };

  // Make logout an alias of signOut for API consistency
  const logout = async () => {
    // For mock users, just clear the user state
    if (user && user.id.startsWith('mock-')) {
      setUser(null);
      toast.success('Logged out successfully');
      return;
    }
    
    // For real users, call signOut
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
