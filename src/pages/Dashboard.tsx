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

  // Debug: Log user role to console
  console.log('Dashboard - User role:', user.role, 'User data:', user);

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case 'fa_admin':
      console.log('Rendering AdminDashboard for fa_admin');
      return <AdminDashboard />;
    case 'requester':
      console.log('Rendering RequesterDashboard for requester');
      return <RequesterDashboard />;
    case 'receiver':
      console.log('Rendering ReceiverDashboard for receiver');
      return <ReceiverDashboard />;
    default:
      console.log('Rendering default RequesterDashboard for role:', user.role);
      return <RequesterDashboard />; // Default to requester dashboard
  }
};

export default Dashboard;