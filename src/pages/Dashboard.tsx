import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import RequesterDashboard from './RequesterDashboard';
import ReceiverDashboard from './ReceiverDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're sure there's no user (not loading and no user)
    if (!loading && !user) {
      // Add a small delay to ensure auth state is fully processed
      const timer = setTimeout(() => {
        navigate('/');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-primary">กำลังโหลด...</div>
      </div>
    );
  }

  // If no user, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case 'fa_admin':
      return <AdminDashboard />;
    case 'requester':
      return <RequesterDashboard />;
    case 'receiver':
      return <ReceiverDashboard />;
    default:
      return <RequesterDashboard />; // Default to requester dashboard
  }
};

export default Dashboard;