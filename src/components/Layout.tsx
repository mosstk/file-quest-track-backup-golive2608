
import React from 'react';
import Navbar from './Navbar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  requireAuth = false,
  allowedRoles = [] 
}) => {
  const { user, loading } = useAuth();

  // Debug output for troubleshooting
  console.log('Layout rendered with:', { 
    user, 
    requireAuth, 
    allowedRoles,
    userRole: user?.role 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (requireAuth && !user) {
    console.log('User not authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('User lacks permission, redirecting to dashboard', { 
      userRole: user.role, 
      allowedRoles 
    });
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 transition-all animate-fade-in">
        {children}
      </main>
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} TOA. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
