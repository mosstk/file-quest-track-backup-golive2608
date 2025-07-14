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

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRequests: 0,
    pendingRequests: 0
  });
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all requests for admin with requester information
        const { data: requestsData, error: requestsError } = await supabase
          .from('requests')
          .select(`
            *,
            requester:profiles!requests_requester_id_fkey(
              full_name,
              email,
              employee_id,
              company,
              department,
              division
            )
          `)
          .order('created_at', { ascending: false });
        
        if (requestsError) {
          console.error('Error fetching requests:', requestsError);
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูลคำขอ');
        } else {
          const normalizedRequests = requestsData?.map(item => {
            const normalized = normalizeFileRequest(item);
            // Add requester information
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
        }
        
        // Fetch user statistics
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, is_active');
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
        } else {
          setStats(prev => ({
            ...prev,
            totalUsers: usersData?.length || 0,
            activeUsers: usersData?.filter(u => u.is_active).length || 0,
            totalRequests: requestsData?.length || 0,
            pendingRequests: requestsData?.filter(r => r.status === 'pending').length || 0
          }));
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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

  if (loading) {
    return (
      <Layout requireAuth allowedRoles={['fa_admin']}>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-primary">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth allowedRoles={['fa_admin']}>
      <div className="container py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
            <p className="text-muted-foreground mt-1">
              ยินดีต้อนรับ, {user?.name || user?.full_name}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => navigate('/admin')}>จัดการผู้ใช้งาน</Button>
            <Button variant="outline" onClick={() => navigate('/requests')}>ดูคำขอทั้งหมด</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">ผู้ใช้งานทั้งหมด</CardTitle>
              <CardDescription>จำนวนผู้ใช้งานในระบบ</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">ใช้งานได้: {stats.activeUsers}</p>
            </CardContent>
          </Card>
          
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
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">คำขอล่าสุดที่ต้องดำเนินการ</h2>
            
            {error ? (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <RequestTable requests={requests.filter(r => r.status === 'pending').slice(0, 5)} />
                
                {statusCounts.pending > 5 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => navigate('/requests')}>
                      ดูคำขอรอดำเนินการทั้งหมด
                    </Button>
                  </div>
                )}
                
                {statusCounts.pending === 0 && !loading && (
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="pt-6 text-center">
                      <p className="text-gray-600">ไม่มีคำขอที่ต้องดำเนินการ</p>
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

export default AdminDashboard;