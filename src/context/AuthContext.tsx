
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UserRole } from '@/types';

// Define our custom UserProfile type that extends the basic User type
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  employeeId?: string;
  company?: string;
  department?: string;
  division?: string;
  role: UserRole;
}

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Record<string, any>) => Promise<void>;
  signOut: (callback?: () => void) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        // Validate and ensure role is one of the allowed values
        const roleValue = data.role || 'requester';
        const validatedRole: UserRole = 
          (roleValue === 'fa_admin' || roleValue === 'requester' || roleValue === 'receiver') 
            ? roleValue 
            : 'requester'; // Default to requester if invalid role

        // Combine Supabase auth user data with profile data
        return {
          id: userId,
          email: session?.user?.email || '',
          name: data.full_name,
          avatar: data.avatar_url,
          employeeId: data.employee_id,
          company: data.company,
          department: data.department,
          division: data.division,
          role: validatedRole,
        };
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
    }
    
    // Return basic user info if profile fetch fails
    return {
      id: userId,
      email: session?.user?.email || '',
      role: 'requester' as UserRole
    };
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          const userProfile = await fetchUserProfile(currentSession.user.id);
          setUser(userProfile);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData: Record<string, any>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    if (error) throw error;
  };

  const signOut = async (callback?: () => void) => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    if (callback) callback();
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
