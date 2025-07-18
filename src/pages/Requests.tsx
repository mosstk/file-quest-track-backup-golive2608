import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RequestTable from '@/components/RequestTable';
import { useNavigate } from 'react-router-dom';
import { FileRequest, RequestStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { normalizeFileRequest } from '@/lib/utils/formatters';
import { toast } from 'sonner';
import { Plus, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Requests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // For fa_admin, use RPC function to get all requests
      if (user.role === 'fa_admin') {
        const { data, error: fetchError } = await supabase
          .rpc('get_all_requests');
        
        if (fetchError) {
          console.error('Error fetching requests:', fetchError);
          throw fetchError;
        }
        
        const normalizedRequests = data?.map(item => ({
          id: item.id,
          requester_id: item.requester_id,
          document_name: item.document_name,
          documentName: item.document_name,
          receiver_email: item.receiver_email,
          receiverEmail: item.receiver_email,
          file_path: item.file_path,
          fileAttachment: item.file_path,
          status: item.status,
          created_at: item.created_at,
          createdAt: item.created_at,
          updated_at: item.updated_at,
          updatedAt: item.updated_at,
          tracking_number: item.tracking_number,
          trackingNumber: item.tracking_number,
          admin_feedback: item.admin_feedback,
          adminFeedback: item.admin_feedback,
          is_delivered: item.is_delivered,
          isDelivered: item.is_delivered,
          approved_by: item.approved_by,
          requesterName: item.requester_name,
          requesterEmail: item.requester_email,
          requesterEmployeeId: item.requester_employee_id,
          requesterCompany: item.requester_company,
          requesterDepartment: item.requester_department,
          requesterDivision: item.requester_division,
        })) || [];
        setRequests(normalizedRequests);
      } else {
        // For other roles, use regular query with filters
        let query = supabase
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
        
        // Filter requests based on user role
        if (user.role === 'requester') {
          query = query.eq('requester_id', user.id);
        } else if (user.role === 'receiver') {
          query = query.eq('receiver_email', user.email);
        }
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) {
          console.error('Error fetching requests:', fetchError);
          throw fetchError;
        }
        
        const normalizedRequests = data?.map(item => {
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
      
    } catch (error: any) {
      console.error('Error loading requests:', error);
      setError('ไม่สามารถโหลดข้อมูลคำขอได้');
      toast.error('ไม่สามารถโหลดข้อมูลคำขอได้');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/requests/new');
  };

  const handleRefresh = () => {
    loadRequests();
    toast.success('รีเฟรชข้อมูลเรียบร้อย');
  };

  // Filter requests by status for tabs
  const getFilteredRequests = (status: string) => {
    if (status === 'all') return requests;
    return requests.filter(req => req.status === status);
  };

  // Count requests by status
  const statusCounts = React.useMemo(() => {
    const counts = {
      all: requests.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      rework: 0,
      completed: 0, // จะนับจาก is_delivered แทน
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">คำขอส่งไฟล์</h1>
            <p className="text-muted-foreground mt-1">
              จัดการคำขอส่งไฟล์และติดตามสถานะ
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              รีเฟรช
            </Button>
            {(user?.role === 'requester' || user?.role === 'fa_admin') && (
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                สร้างคำขอใหม่
              </Button>
            )}
          </div>
        </div>

        {error ? (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <span>{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadRequests}
                  className="ml-auto"
                >
                  ลองใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">ทั้งหมด ({statusCounts.all})</TabsTrigger>
              <TabsTrigger value="pending">รอดำเนินการ ({statusCounts.pending})</TabsTrigger>
              <TabsTrigger value="approved">อนุมัติแล้ว ({statusCounts.approved})</TabsTrigger>
              <TabsTrigger value="rework">ต้องแก้ไข ({statusCounts.rework})</TabsTrigger>
              <TabsTrigger value="rejected">ปฏิเสธ ({statusCounts.rejected})</TabsTrigger>
              <TabsTrigger value="completed">เสร็จสิ้น ({statusCounts.completed})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <RequestTable 
                requests={getFilteredRequests(activeTab)} 
                showActions={true}
              />
              
              {getFilteredRequests(activeTab).length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-muted-foreground">
                      {activeTab === 'all' 
                        ? 'ยังไม่มีคำขอส่งไฟล์ในระบบ' 
                        : `ไม่มีคำขอในสถานะ "${activeTab}"`
                      }
                    </div>
                    {(user?.role === 'requester' || user?.role === 'fa_admin') && activeTab === 'all' && (
                      <Button 
                        onClick={handleCreateNew}
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        สร้างคำขอแรก
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Requests;