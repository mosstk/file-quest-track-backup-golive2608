
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileRequest } from '@/types';

interface StatsProps {
  requests: FileRequest[];
  userRole: string;
}

const DashboardStats: React.FC<StatsProps> = ({ requests, userRole }) => {
  const statusCounts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    rework: 0,
    completed: 0,
    total: requests.length,
  };
  
  requests.forEach(req => {
    statusCounts[req.status]++;
  });

  if (userRole !== 'fa_admin' && userRole !== 'requester') {
    return null;
  }

  return (
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
          <p className="text-3xl font-bold text-amber-600">
            {statusCounts.rework + statusCounts.rejected}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
