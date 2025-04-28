
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import RequestTable from '@/components/RequestTable';
import { RequestStatus } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockRequests } from '@/lib/mockData';

const Requests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Filter requests based on user role and active tab
  const filteredRequests = React.useMemo(() => {
    if (!user) return [];
    
    // First filter by user role
    let requests = [];
    if (user.role === 'fa_admin') {
      requests = mockRequests;
    } else if (user.role === 'requester') {
      requests = mockRequests.filter(req => req.requesterEmail === user.email);
    }
    
    // Then filter by tab
    if (activeTab === 'all') {
      return requests;
    } else {
      return requests.filter(req => req.status === activeTab);
    }
  }, [user, activeTab]);
  
  const handleCreateRequest = () => {
    navigate('/requests/new');
  };
  
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
