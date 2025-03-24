
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import RequestTable from '@/components/RequestTable';
import { FileRequest, RequestStatus } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - Same as in Dashboard
const mockRequests: FileRequest[] = [
  {
    id: '1',
    requesterName: 'John Doe',
    requesterEmployeeId: 'EMP001',
    requesterCompany: 'Example Corp',
    requesterDepartment: 'Marketing',
    requesterDivision: 'Digital Marketing',
    documentName: 'Q3 Marketing Report',
    requesterEmail: 'john@example.com',
    receiverEmail: 'receiver@example.com',
    fileAttachment: 'marketing_report_q3.pdf',
    status: 'pending',
    createdAt: '2023-10-15T09:30:00',
    updatedAt: '2023-10-15T09:30:00',
  },
  {
    id: '2',
    requesterName: 'Jane Smith',
    requesterEmployeeId: 'EMP002',
    requesterCompany: 'Example Corp',
    requesterDepartment: 'Finance',
    requesterDivision: 'Accounting',
    documentName: 'Annual Financial Statement',
    requesterEmail: 'jane@example.com',
    receiverEmail: 'client@example.com',
    fileAttachment: 'financial_statement_2023.pdf',
    status: 'approved',
    createdAt: '2023-10-10T14:20:00',
    updatedAt: '2023-10-12T11:45:00',
    trackingNumber: 'TRK78901234',
  },
  {
    id: '3',
    requesterName: 'Mike Johnson',
    requesterEmployeeId: 'EMP003',
    requesterCompany: 'Example Corp',
    requesterDepartment: 'HR',
    requesterDivision: 'Recruitment',
    documentName: 'New Employee Onboarding Pack',
    requesterEmail: 'mike@example.com',
    receiverEmail: 'newemployee@example.com',
    fileAttachment: 'onboarding_pack.pdf',
    status: 'rework',
    createdAt: '2023-10-05T10:15:00',
    updatedAt: '2023-10-06T16:30:00',
    adminFeedback: 'Please update the company policy section.',
  },
  {
    id: '4',
    requesterName: 'Sarah Lee',
    requesterEmployeeId: 'EMP004',
    requesterCompany: 'Example Corp',
    requesterDepartment: 'Legal',
    requesterDivision: 'Compliance',
    documentName: 'Vendor Contract',
    requesterEmail: 'sarah@example.com',
    receiverEmail: 'vendor@example.com',
    fileAttachment: 'vendor_contract_2023.pdf',
    status: 'rejected',
    createdAt: '2023-10-02T08:45:00',
    updatedAt: '2023-10-03T13:20:00',
    adminFeedback: 'Contract terms do not meet company guidelines.',
  },
  {
    id: '5',
    requesterName: 'David Brown',
    requesterEmployeeId: 'EMP005',
    requesterCompany: 'Example Corp',
    requesterDepartment: 'Sales',
    requesterDivision: 'Enterprise',
    documentName: 'Client Proposal',
    requesterEmail: 'david@example.com',
    receiverEmail: 'client@example.com',
    fileAttachment: 'client_proposal.pdf',
    status: 'completed',
    createdAt: '2023-09-28T15:30:00',
    updatedAt: '2023-09-30T09:45:00',
    trackingNumber: 'TRK45678901',
    isDelivered: true,
  },
];

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
