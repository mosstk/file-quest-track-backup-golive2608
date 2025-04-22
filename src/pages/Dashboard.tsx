
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RequestTable from '@/components/RequestTable';
import { useNavigate } from 'react-router-dom';
import { FileRequest } from '@/types';

// Mock data for demonstration
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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Filter requests based on user role
  const filteredRequests = React.useMemo(() => {
    if (!user) return [];
    
    switch (user.role) {
      case 'fa_admin':
        return mockRequests;
      case 'requester':
        return mockRequests.filter(req => req.requesterEmail === user.email);
      case 'receiver':
        return mockRequests.filter(req => 
          req.receiverEmail === user.email && 
          req.status === 'approved'
        );
      default:
        return [];
    }
  }, [user]);
  
  // Count requests by status
  const statusCounts = React.useMemo(() => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      rework: 0,
      completed: 0,
      total: filteredRequests.length,
    };
    
    filteredRequests.forEach(req => {
      counts[req.status]++;
    });
    
    return counts;
  }, [filteredRequests]);
  
  const handleCreateRequest = () => {
    navigate('/requests/new');
  };

  return (
    <Layout requireAuth>
      <div className="container py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">แดชบอร์ด</h1>
            <p className="text-muted-foreground mt-1">
              ยินดีต้อนรับ, {user?.name || user?.email || 'ผู้ใช้งาน'}
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
            <RequestTable requests={filteredRequests.slice(0, 5)} />
            
            {filteredRequests.length > 5 && (
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
