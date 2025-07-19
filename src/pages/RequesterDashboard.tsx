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

const RequesterDashboard = () => {
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
        
        // Fetch only user's requests with complete data including requester details
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
          .eq('requester_id', user.id)
          .order('created_at', { ascending: false });
        
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
  
  // Count requests by status
  const statusCounts = React.useMemo(() => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      rework: 0,
      completed: 0, // จะนับจาก is_delivered แทน
      total: requests.length,
    };
    
    requests.forEach(req => {
      // นับตาม status ยกเว้น completed
      if (req.status === 'pending') counts.pending++;
      else if (req.status === 'approved') counts.approved++;
      else if (req.status === 'rejected') counts.rejected++;
      else if (req.status === 'rework') counts.rework++;
      
      // นับ completed จาก is_delivered แทน status
      if (req.is_delivered === true || req.isDelivered === true) {
        counts.completed++;
      }
    });
    
    return counts;
  }, [requests]);
  
  const handleCreateRequest = () => {
    navigate('/requests/new');
  };

  if (loading) {
    return (
      <Layout requireAuth allowedRoles={['requester']}>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-primary">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth allowedRoles={['requester']}>
      <div className="container py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">แดชบอร์ดผู้ส่งเอกสาร</h1>
            <p className="text-muted-foreground mt-1">
              ยินดีต้อนรับ, {user?.name || user?.full_name}
            </p>
          </div>
          
          <Button onClick={handleCreateRequest}>สร้างคำขอใหม่</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">คำขอทั้งหมด</CardTitle>
              <CardDescription>จำนวนคำขอของคุณ</CardDescription>
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
              <CardTitle className="text-lg">กำลังจัดส่ง</CardTitle>
              <CardDescription>คำขอที่กำลังจัดส่ง</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{statusCounts.approved}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">ต้องแก้ไข</CardTitle>
              <CardDescription>คำขอที่ต้องแก้ไข</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{statusCounts.rework + statusCounts.rejected}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">รับเอกสารแล้ว</CardTitle>
              <CardDescription>คำขอที่ได้รับเอกสารแล้ว</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">{statusCounts.completed}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">คำขอของคุณ</h2>
            
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
                      <p className="text-gray-600">ยังไม่มีคำขอในระบบ</p>
                      <Button 
                        className="mt-4" 
                        onClick={handleCreateRequest}
                      >
                        สร้างคำขอแรกของคุณ
                      </Button>
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

export default RequesterDashboard;