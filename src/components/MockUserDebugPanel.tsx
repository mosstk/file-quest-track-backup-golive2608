
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MockUserDebugPanel = () => {
  const { user, session } = useAuth();

  if (!user) {
    return null;
  }

  // Check if this is one of the test users from the migration
  const testUserEmails = ['admin@toagroup.com', 'requester@toagroup.com', 'receiver@toagroup.com'];
  const isTestUser = testUserEmails.includes(user.email || '');

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-blue-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-800">User Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-700">Status:</span>
            <Badge variant={isTestUser ? "secondary" : "default"}>
              {isTestUser ? "Test User" : "Real User"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-700">Auth Status:</span>
            <Badge variant={session ? "default" : "destructive"}>
              {session ? "Authenticated" : "Not Authenticated"}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-blue-700">User ID:</div>
            <div className="text-xs font-mono bg-blue-100 p-1 rounded">
              {user.id}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-blue-700">Name:</div>
            <div className="text-xs font-mono bg-blue-100 p-1 rounded">
              {user.full_name || user.name}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-blue-700">Email:</div>
            <div className="text-xs font-mono bg-blue-100 p-1 rounded">
              {user.email}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-blue-700">Role:</div>
            <div className="text-xs font-mono bg-blue-100 p-1 rounded">
              {user.role}
            </div>
          </div>
          
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            ✅ ใช้งาน Supabase Authentication จริง
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockUserDebugPanel;
