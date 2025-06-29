
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import FileRequestForm from '@/components/FileRequestForm';
import { FileRequest } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { normalizeFileRequest } from '@/lib/utils/formatters';

const CreateEditRequest = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<FileRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const isEditMode = !!id;

  useEffect(() => {
    const fetchRequest = async () => {
      if (!isEditMode || !user) return;

      try {
        setLoading(true);
        console.log('Fetching request with ID:', id);
        
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching request:', error);
          throw error;
        }
        
        if (data) {
          console.log('Request data fetched:', data);
          setRequest(normalizeFileRequest(data as FileRequest));
        }
      } catch (error) {
        console.error('Error fetching request:', error);
        toast.error('ไม่สามารถโหลดข้อมูลคำขอได้: ' + (error as Error).message);
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

    if (!user.id) {
      toast.error('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    setSubmitting(true);

    try {
      const document_name = formData.document_name || formData.documentName;
      const receiver_email = formData.receiver_email || formData.receiverEmail;
      
      if (!document_name || !receiver_email) {
        toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }

      console.log('Submitting request:', {
        user_id: user.id,
        user_role: user.role,
        form_data: formData
      });

      const apiData = {
        document_name,
        receiver_email,
        requester_id: user.id,
        file_path: formData.file_path || null,
        status: formData.status || 'pending'
      };

      if (isEditMode && request) {
        console.log('Updating existing request:', id);
        
        const { error } = await supabase
          .from('requests')
          .update(apiData)
          .eq('id', id);

        if (error) throw error;
        
        toast.success('แก้ไขคำขอเรียบร้อย');
        navigate(`/request/${id}`);
      } else {
        console.log('Creating new request with data:', apiData);
        
        const { data, error } = await supabase
          .from('requests')
          .insert([apiData])
          .select()
          .single();

        if (error) {
          console.error('Insert error details:', error);
          throw error;
        }
        
        console.log('Request created successfully:', data);
        toast.success('สร้างคำขอเรียบร้อย');
        navigate('/requests');
      }
    } catch (error: any) {
      console.error('Error submitting request:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      
      if (error?.message?.includes('permission denied')) {
        errorMessage = 'ไม่มีสิทธิ์ในการบันทึกข้อมูล กรุณาติดต่อผู้ดูแลระบบ';
      } else if (error?.message?.includes('policy')) {
        errorMessage = 'ไม่ผ่านเงื่อนไขการรักษาความปลอดภัย กรุณาเข้าสู่ระบบใหม่';
      } else if (error?.message) {
        errorMessage = `ข้อผิดพลาด: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
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

  if (!user) {
    return (
      <Layout requireAuth allowedRoles={['fa_admin', 'requester']}>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-red-500">กรุณาเข้าสู่ระบบเพื่อใช้ฟีเจอร์นี้</div>
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
          {user && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ เข้าสู่ระบบแล้ว: {user.name} ({user.role})
              </p>
              <p className="text-xs text-green-600 mt-1">
                ID: {user.id} | อีเมล: {user.email}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                🎯 ใช้งาน User จริงในฐานข้อมูล Supabase
              </p>
            </div>
          )}
        </div>
        
        <FileRequestForm 
          onSubmit={handleSubmit} 
          initialData={request || {}} 
          isRework={isEditMode && request?.status === 'rework'}
          disabled={submitting}
        />
        
        {submitting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span>กำลังบันทึกข้อมูล...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CreateEditRequest;
