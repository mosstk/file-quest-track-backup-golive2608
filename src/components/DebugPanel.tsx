
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DebugPanel: React.FC = () => {
  const { user, session } = useAuth();

  // แสดงเฉพาะใน development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-auto z-50 bg-white/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🔧 Debug Panel
          <Badge variant={user ? 'default' : 'destructive'}>
            {user ? 'Logged In' : 'No User'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        {user && (
          <div className="space-y-1">
            <div><strong>User ID:</strong> {user.id}</div>
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>Role:</strong> {user.role}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Type:</strong> 
              <Badge variant={user.name?.startsWith('Test ') ? 'secondary' : 'default'} className="ml-1">
                {user.name?.startsWith('Test ') ? 'Mock User' : 'Real User'}
              </Badge>
            </div>
          </div>
        )}
        {session && (
          <div className="border-t pt-2">
            <div><strong>Session:</strong> Active</div>
            <div><strong>Auth ID:</strong> {session.user?.id}</div>
          </div>
        )}
        <div className="border-t pt-2 text-gray-500">
          <div>Time: {new Date().toLocaleTimeString()}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
