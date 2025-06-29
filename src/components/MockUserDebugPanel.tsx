
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MockUserDebugPanel = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const isTestUser = user.email?.includes('@toagroup.com');
  const testUserIds = [
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222', 
    '33333333-3333-3333-3333-333333333333'
  ];
  const isKnownTestUser = testUserIds.includes(user.id);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-green-50 border-green-200 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-green-800">Real User Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-700">Status:</span>
            <Badge variant={isTestUser ? "default" : "secondary"}>
              {isTestUser ? "Test User" : "Real User"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-700">Auth Status:</span>
            <Badge variant="default">
              Authenticated
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-green-700">User ID:</div>
            <div className="text-xs font-mono bg-green-100 p-1 rounded">
              {user.id}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-green-700">Email:</div>
            <div className="text-xs font-mono bg-green-100 p-1 rounded">
              {user.email}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-green-700">Role:</div>
            <div className="text-xs font-mono bg-green-100 p-1 rounded">
              {user.role}
            </div>
          </div>
          
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
            ✅ ใช้งาน User จริงจากฐานข้อมูล Supabase
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockUserDebugPanel;
