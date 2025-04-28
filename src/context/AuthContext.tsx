
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

/**
 * Helper to fetch current profile from Supabase
 */
async function fetchUserProfile(supabaseUser: any): Promise<User | null> {
  if (!supabaseUser) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }

  if (data) {
    // Create a user object that maps DB fields to our interface including compatibility properties
    const user: User = {
      id: data.id,
      full_name: data.full_name,
      email: supabaseUser.email,
      username: data.username,
      avatar_url: data.avatar_url,
      employee_id: data.employee_id,
      company: data.company,
      department: data.department,
      division: data.division,
      role: data.role as UserRole,
      
      // Add properties for backward compatibility
      name: data.full_name,
      employeeId: data.employee_id,
      avatar: data.avatar_url
    };
    
    return user;
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Auth initialization & Supabase session restoration logic
  React.useEffect(() => {
    let mounted = true;
    async function getSessionAndProfile() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUser = session?.user;

      if (!supabaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await fetchUserProfile(supabaseUser);
      if (mounted) setUser(profile);
      setLoading(false);
    }
    getSessionAndProfile();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const supaUser = session?.user;
      if (supaUser) {
        fetchUserProfile(supaUser).then((profile) => setUser(profile));
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => { mounted = false; subscription.unsubscribe(); }
  }, []);

  // Login: pass email + password and fetch profile if succeeded
  const login = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
    const sessionUser = data.user;
    const profile = await fetchUserProfile(sessionUser);
    setUser(profile);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
