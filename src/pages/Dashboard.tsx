import React from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileRequest } from '@/types';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentRequests from '@/components/dashboard/RecentRequests';

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
          (req.status === 'approved' || req.status === 'completed')
        );
      default:
        return [];
    }
  }, [user]);

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
            <Button onClick={() => navigate('/requests/new')}>สร้างคำขอใหม่</Button>
          )}
        </div>
        
        <DashboardStats requests={filteredRequests} userRole={user?.role || ''} />
        <RecentRequests requests={filteredRequests} userRole={user?.role || ''} />
      </div>
    </Layout>
  );
};

export default Dashboard;
