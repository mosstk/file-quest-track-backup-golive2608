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

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch approved requests sent to this receiver's email
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .eq('status', 'approved')
          .eq('receiver_email', user.email)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching requests:', error);
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
          return;
        }
        
        const normalizedRequests = data?.map(normalizeFileRequest) || [];
        setRequests(normalizedRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [user]);
  
  // Count requests by delivery status
  const deliveryCounts = React.useMemo(() => {
    const counts = {
      delivered: 0,
      notDelivered: 0,
      total: requests.length,
    };
    
    requests.forEach(req => {
      if (req.isDelivered) {
        counts.delivered++;
      } else {
        counts.notDelivered++;
      }
    });
    
    return counts;
  }, [requests]);

  if (loading) {
    return (
      <Layout requireAuth allowedRoles={['receiver']}>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-primary">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth allowedRoles={['receiver']}>
      <div className="container py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">แดชบอร์ดผู้รับเอกสาร</h1>
            <p className="text-muted-foreground mt-1">
              ยินดีต้อนรับ, {user?.name || user?.full_name}
            </p>
          </div>
          
          <Button variant="outline" onClick={() => navigate('/requests')}>
            ดูเอกสารทั้งหมด
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">เอกสารทั้งหมด</CardTitle>
              <CardDescription>เอกสารที่ส่งมาถึงคุณ</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{deliveryCounts.total}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">รับแล้ว</CardTitle>
              <CardDescription>เอกสารที่ยืนยันการรับแล้ว</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{deliveryCounts.delivered}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">ยังไม่ได้รับ</CardTitle>
              <CardDescription>เอกสารที่รอการยืนยัน</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{deliveryCounts.notDelivered}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">เอกสารที่ส่งมาถึงคุณ</h2>
            
            {error ? (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <RequestTable requests={requests.slice(0, 10)} />
                
                {requests.length > 10 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => navigate('/requests')}>
                      ดูทั้งหมด
                    </Button>
                  </div>
                )}
                
                {requests.length === 0 && !loading && (
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="pt-6 text-center">
                      <p className="text-gray-600">ยังไม่มีเอกสารที่ส่งมาถึงคุณ</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReceiverDashboard;