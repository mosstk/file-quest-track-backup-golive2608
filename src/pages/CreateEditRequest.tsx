import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import FileRequestForm from '@/components/FileRequestForm';
import { FileRequest } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { normalizeFileRequest, prepareFileRequestForApi } from '@/lib/utils/formatters';

const CreateEditRequest = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<FileRequest | null>(null);
  const [loading, setLoading] = useState(false);
  
  const isEditMode = !!id;

  useEffect(() => {
    const fetchRequest = async () => {
      if (!isEditMode || !user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) setRequest(normalizeFileRequest(data as FileRequest));
      } catch (error) {
        console.error('Error fetching request:', error);
        toast.error('ไม่สามารถโหลดข้อมูลคำขอได้');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, isEditMode, user]);
  
  const handleSubmit = async (formData: Partial<FileRequest>) => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
      return;
    }

    try {
      // Make sure required fields are properly set
      if (!formData.document_name && formData.documentName) {
        formData.document_name = formData.documentName;
      }
      
      if (!formData.receiver_email && formData.receiverEmail) {
        formData.receiver_email = formData.receiverEmail;
      }
      
      if (!formData.document_name || !formData.receiver_email) {
        toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }

      console.log('Form data before API preparation:', formData);

      // Prepare data for API - this function now returns only valid DB fields
      const apiData = prepareFileRequestForApi({
        ...formData,
        status: formData.status || 'pending',
        requester_id: user.id
      });

      console.log('API data after preparation:', apiData);

      if (isEditMode && request) {
        const { error } = await supabase
          .from('requests')
          .update(apiData)
          .eq('id', id);

        if (error) throw error;
        toast.success('แก้ไขคำขอเรียบร้อย');
        navigate(`/request/${id}`);
      } else {
        const { data, error } = await supabase
          .from('requests')
          .insert([apiData]);

        if (error) throw error;
        toast.success('สร้างคำขอเรียบร้อย');
        navigate('/requests');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
