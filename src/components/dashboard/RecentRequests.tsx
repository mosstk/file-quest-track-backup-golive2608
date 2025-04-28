
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import RequestTable from '@/components/RequestTable';
import { FileRequest } from '@/types';

interface RecentRequestsProps {
  requests: FileRequest[];
  userRole: string;
}

const RecentRequests: React.FC<RecentRequestsProps> = ({ requests, userRole }) => {
  const navigate = useNavigate();
  
  const getRequestsTitle = (role: string) => {
    switch (role) {
      case 'fa_admin':
        return 'คำขอล่าสุด';
      case 'requester':
        return 'คำขอของคุณ';
      default:
        return 'เอกสารที่จัดส่งมาถึงคุณ';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {getRequestsTitle(userRole)}
        </h2>
        <RequestTable requests={requests.slice(0, 5)} />
        
        {requests.length > 5 && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => navigate('/requests')}>
              ดูทั้งหมด
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentRequests;
