
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const mockUsers: Record<UserRole, User> = {
  fa_admin: {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    employeeId: 'ADM001',
    company: 'Example Corp',
    department: 'Finance & Accounting',
    division: 'Administration',
    role: 'fa_admin',
  },
  requester: {
    id: 'req-1',
    name: 'Requester User',
    email: 'requester@example.com',
    employeeId: 'REQ001',
    company: 'Example Corp',
    department: 'Marketing',
    division: 'Digital Marketing',
    role: 'requester',
  },
  receiver: {
    id: 'rec-1',
    name: 'Receiver User',
    email: 'receiver@example.com',
    employeeId: 'REC001',
    company: 'Partner Corp',
    department: 'Operations',
    division: 'Supply Chain',
    role: 'receiver',
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (role: UserRole) => {
    const selectedUser = mockUsers[role];
    setUser(selectedUser);
    localStorage.setItem('user', JSON.stringify(selectedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
