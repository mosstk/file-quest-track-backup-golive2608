
import React from 'react';
import Layout from '@/components/Layout';
import FileRequestForm from '@/components/FileRequestForm';
import LoadingState from '@/components/LoadingState';
import UserInfoDisplay from '@/components/UserInfoDisplay';
import SubmittingOverlay from '@/components/SubmittingOverlay';
import { useRequestForm } from '@/hooks/useRequestForm';

const CreateEditRequest = () => {
  const {
    request,
    loading,
    submitting,
    isEditMode,
    handleSubmit,
    user
  } = useRequestForm();

  if (loading) {
    return (
      <Layout requireAuth allowedRoles={['fa_admin', 'requester']}>
        <div className="container py-8">
          <LoadingState />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout requireAuth allowedRoles={['fa_admin', 'requester']}>
        <div className="container py-8">
          <LoadingState message="กรุณาเข้าสู่ระบบเพื่อใช้ฟีเจอร์นี้" />
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
          {user && <UserInfoDisplay user={user} />}
        </div>
        
        <FileRequestForm 
          onSubmit={handleSubmit} 
          initialData={request || {}} 
          isRework={isEditMode && request?.status === 'rework'}
          disabled={submitting}
        />
        
        {submitting && <SubmittingOverlay />}
      </div>
    </Layout>
  );
};

export default CreateEditRequest;
