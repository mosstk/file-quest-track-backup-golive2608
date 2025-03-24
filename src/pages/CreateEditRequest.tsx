
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import FileRequestForm from '@/components/FileRequestForm';
import { FileRequest } from '@/types';
import { toast } from 'sonner';

// Mock data - Same as in other components
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

const CreateEditRequest = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<FileRequest | null>(null);
  const [loading, setLoading] = useState(false);
  
  const isEditMode = !!id;
  
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      const foundRequest = mockRequests.find(req => req.id === id);
      
      if (foundRequest) {
        setRequest(foundRequest);
      }
      
      setLoading(false);
    }
  }, [id, isEditMode]);
  
  const handleSubmit = (formData: any) => {
    if (isEditMode && request) {
      // Update existing request
      const updatedRequest = {
        ...request,
        ...formData,
        status: user?.role === 'fa_admin' ? request.status : 'pending',
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updated request:', updatedRequest);
      toast.success('แก้ไขคำขอเรียบร้อย');
      
      // Redirect back to request detail
      navigate(`/request/${id}`);
    } else {
      // Create new request
      const newRequest: FileRequest = {
        id: `request-${Date.now()}`,
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('New request:', newRequest);
      toast.success('สร้างคำขอเรียบร้อย');
      
      // Redirect to requests list
      navigate('/requests');
    }
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'แก้ไขคำขอส่งไฟล์' : 'สร้างคำขอส่งไฟล์ใหม่'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode 
              ? 'ปรับปรุงรายละเอียดคำขอส่งไฟล์ของคุณ' 
              : 'กรอกข้อมูลเพื่อสร้างคำขอส่งไฟล์ใหม่'
            }
          </p>
        </div>
        
        <FileRequestForm 
          onSubmit={handleSubmit} 
          initialData={request || {}} 
          isRework={isEditMode && request?.status === 'rework'}
        />
      </div>
    </Layout>
  );
};

export default CreateEditRequest;
