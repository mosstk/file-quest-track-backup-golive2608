
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MockUserDebugPanel = () => {
  const { user } = useAuth();

  if (!user || !user.name?.startsWith('Test ')) {
    return null;
  }

  const isMockUser = user.name?.startsWith('Test ');
  const mockUserIds = [
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222', 
    '33333333-3333-3333-3333-333333333333'
  ];
  const isRLSReady = mockUserIds.includes(user.id);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-blue-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-800">Mock User Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-700">Status:</span>
            <Badge variant={isMockUser ? "default" : "secondary"}>
              {isMockUser ? "Mock User" : "Real User"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-700">RLS Ready:</span>
            <Badge variant={isRLSReady ? "default" : "destructive"}>
              {isRLSReady ? "Ready" : "Not Ready"}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-blue-700">User ID:</div>
            <div className="text-xs font-mono bg-blue-100 p-1 rounded">
              {user.id}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-blue-700">Role:</div>
            <div className="text-xs font-mono bg-blue-100 p-1 rounded">
              {user.role}
            </div>
          </div>
          
          {!isRLSReady && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              ⚠️ RLS policies may not work correctly
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MockUserDebugPanel;
