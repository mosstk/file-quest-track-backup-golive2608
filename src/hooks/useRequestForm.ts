import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FileRequest } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { normalizeFileRequest } from '@/lib/utils/formatters';

export const useRequestForm = () => {
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

  return {
    request,
    loading,
    submitting,
    isEditMode,
    handleSubmit,
    user
  };
};