
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import RequestTable from '@/components/RequestTable';
import { RequestStatus, FileRequest } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { normalizeFileRequest } from '@/lib/utils/formatters';

const Requests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [requests, setRequests] = useState<FileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        let query = supabase.from('requests').select('*');
        
        // Filter based on user role
        if (user.role === 'fa_admin') {
          // Admin can see all requests
        } else if (user.role === 'requester') {
          query = query.eq('requester_id', user.id);
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
  
  // Filter requests based on active tab
  const filteredRequests = React.useMemo(() => {
    if (activeTab === 'all') {
      return requests;
    } else {
      return requests.filter(req => req.status === activeTab);
    }
  }, [requests, activeTab]);
  
  const handleCreateRequest = () => {
    navigate('/requests/new');
  };
  
  if (loading) {
    return (
      <Layout requireAuth allowedRoles={['fa_admin', 'requester']}>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-primary">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout requireAuth allowedRoles={['fa_admin', 'requester']}>
      <div className="container py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">คำขอส่งไฟล์</h1>
            <p className="text-muted-foreground mt-1">
              จัดการและติดตามคำขอส่งไฟล์ทั้งหมด
            </p>
          </div>
          
          {user?.role === 'requester' && (
            <Button onClick={handleCreateRequest}>สร้างคำขอใหม่</Button>
          )}
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full md:w-auto mb-6">
            <TabsTrigger value="all" className="flex-1">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">รอการอนุมัติ</TabsTrigger>
            <TabsTrigger value="approved" className="flex-1">อนุมัติแล้ว</TabsTrigger>
            <TabsTrigger value="rework" className="flex-1">ต้องแก้ไข</TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1">ปฏิเสธ</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <RequestTable requests={filteredRequests} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Requests;
