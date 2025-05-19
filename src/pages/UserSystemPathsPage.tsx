
import React from 'react';
import Layout from '@/components/Layout';
import UserPathsManager from '@/components/UserPathsManager';

const UserSystemPathsPage = () => {
  return (
    <Layout requireAuth allowedRoles={['fa_admin', 'requester']}>
      <div className="container py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">จัดการ System Path</h1>
          <p className="text-muted-foreground mt-1">
            สร้างและจัดการเส้นทางการเก็บไฟล์ในระบบสำหรับผู้ใช้งาน
          </p>
        </div>
        
        <div className="grid gap-6">
          <UserPathsManager />
        </div>
      </div>
    </Layout>
  );
};

export default UserSystemPathsPage;
