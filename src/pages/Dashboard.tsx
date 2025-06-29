
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RequestTable from '@/components/RequestTable';
import { useNavigate } from 'react-router-dom';
import { FileRequest } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { normalizeFileRequest } from '@/lib/utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        let query = supabase.from('requests').select('*');
        
        // Filter based on user role
        switch (user.role) {
          case 'fa_admin':
            // Admin can see all requests
            break;
          case 'requester':
            query = query.eq('requester_id', user.id);
            break;
          case 'receiver':
            query = query.eq('receiver_email', user.email).eq('status', 'approved');
            break;
          default:
            return;
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const normalizedRequests = data?.map(normalizeFileRequest) || [];
        setRequests(normalizedRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [user]);
  
  // Count requests by status
  const statusCounts = React.useMemo(() => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      rework: 0,
      completed: 0,
      total: requests.length,
    };
    
    requests.forEach(req => {
      counts[req.status]++;
    });
    
    return counts;
  }, [requests]);
  
  const handleCreateRequest = () => {
    navigate('/requests/new');
  };

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-primary">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      <div className="container py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">แดชบอร์ด</h1>
            <p className="text-muted-foreground mt-1">
              ยินดีต้อนรับ, {user?.name || user?.full_name}
            </p>
          </div>
          
          {user?.role === 'requester' && (
            <Button onClick={handleCreateRequest}>สร้างคำขอใหม่</Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">คำขอทั้งหมด</CardTitle>
              <CardDescription>จำนวนคำขอในระบบ</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{statusCounts.total}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">รอดำเนินการ</CardTitle>
              <CardDescription>คำขอที่รอการอนุมัติ</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{statusCounts.pending}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">อนุมัติแล้ว</CardTitle>
              <CardDescription>คำขอที่อนุมัติแล้ว</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{statusCounts.approved}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">ต้องแก้ไข/ปฏิเสธ</CardTitle>
              <CardDescription>คำขอที่ต้องแก้ไขหรือถูกปฏิเสธ</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{statusCounts.rework + statusCounts.rejected}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {user?.role === 'fa_admin' 
                ? 'คำขอล่าสุด' 
                : user?.role === 'requester'
                  ? 'คำขอของคุณ'
                  : 'เอกสารที่จัดส่งมาถึงคุณ'
              }
            </h2>
            <RequestTable requests={requests.slice(0, 5)} />
            
            {requests.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => navigate('/requests')}>
                  ดูทั้งหมด
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
