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
        
        // Fetch all requests sent to this receiver (RLS will filter automatically) with requester details
        const { data, error } = await supabase
          .from('requests')
          .select(`
            *,
            requester:profiles!requester_id(
              full_name,
              email,
              employee_id,
              company,
              department,
              division
            )
          `)
          .order('created_at', { ascending: false });
        
        console.log('ReceiverDashboard - Query result:', { data, error });
        
        if (error) {
          console.error('Error fetching requests:', error);
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
          return;
        }
        
        const normalizedRequests = data?.map(item => {
          const normalized = normalizeFileRequest(item);
          // เพิ่มข้อมูลผู้ส่งจาก relation
          if (item.requester) {
            normalized.requesterName = item.requester.full_name || '';
            normalized.requesterEmail = item.requester.email || '';
            normalized.requesterEmployeeId = item.requester.employee_id || '';
            normalized.requesterCompany = item.requester.company || '';
            normalized.requesterDepartment = item.requester.department || '';
            normalized.requesterDivision = item.requester.division || '';
          }
          return normalized;
        }) || [];
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
   
   // Count requests by status and delivery
  const requestStats = React.useMemo(() => {
    const stats = {
      total: requests.length,
      pending: 0, // เอกสารรออนุมัติ
      shipping: 0, // เอกสารอยู่ระหว่างจัดส่ง
      received: 0, // เอกสารที่ได้รับแล้ว
    };
    
    requests.forEach(req => {
      // เอกสารรออนุมัติ
      if (req.status === 'pending') {
        stats.pending++;
      }
      // เอกสารอยู่ระหว่างจัดส่ง (กำลังจัดส่งแต่ยังไม่ได้รับ)
      else if (req.status === 'approved' && !req.isDelivered && !req.is_delivered) {
        stats.shipping++;
      }
      // เอกสารที่ได้รับแล้ว
      else if (req.isDelivered === true || req.is_delivered === true) {
        stats.received++;
      }
    });
    
    return stats;
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">เอกสารทั้งหมด</CardTitle>
              <CardDescription>เอกสารที่ระบุส่งมาถึงคุณทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{requestStats.total}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">รออนุมัติ</CardTitle>
              <CardDescription>เอกสารที่ระบุส่งถึงคุณ แต่รออนุมัติ</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{requestStats.pending}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">อยู่ระหว่างจัดส่ง</CardTitle>
              <CardDescription>เอกสารที่กำลังทำการขนส่ง</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{requestStats.shipping}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">ได้รับแล้ว</CardTitle>
              <CardDescription>เอกสารที่คุณได้รับเอกสารแล้ว</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{requestStats.received}</p>
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