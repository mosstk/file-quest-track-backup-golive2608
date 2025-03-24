
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RequestStatus } from '@/types';

interface RequestStatusBadgeProps {
  status: RequestStatus;
}

const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'รอการอนุมัติ', variant: 'secondary', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' };
      case 'approved':
        return { label: 'อนุมัติแล้ว', variant: 'outline', className: 'bg-green-100 text-green-800 hover:bg-green-100' };
      case 'rejected':
        return { label: 'ปฏิเสธ', variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' };
      case 'rework':
        return { label: 'ต้องแก้ไข', variant: 'outline', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' };
      case 'completed':
        return { label: 'เสร็จสิ้น', variant: 'default', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' };
      default:
        return { label: 'ไม่ทราบสถานะ', variant: 'outline', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={`font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
};

export default RequestStatusBadge;
