
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
      // ตรวจสอบข้อมูลที่จำเป็น
      const document_name = formData.document_name || formData.documentName;
      const receiver_email = formData.receiver_email || formData.receiverEmail;
      
      if (!document_name || !receiver_email) {
        toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }

      console.log('Submitting request:');
      console.log('- User ID:', user.id);
      console.log('- User Role:', user.role);
      console.log('- Is Mock User:', user.name?.startsWith('Test '));
      console.log('- Form data:', formData);

      // เตรียมข้อมูลสำหรับ API
      const apiData = {
        document_name,
        receiver_email,
        requester_id: user.id,
        file_path: formData.file_path || null,
        status: formData.status || 'pending'
      };

      console.log('API data prepared:', apiData);

      // สำหรับ Mock Users ให้ bypass การตรวจสอบ auth.uid()
      if (user.name?.startsWith('Test ')) {
        console.log('Processing mock user request...');
        
        // ตรวจสอบว่า mock user มี profile หรือไม่
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile ไม่มี ให้สร้างใหม่
          console.log('Creating profile for mock user...');
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.full_name,
              email: user.email,
              employee_id: user.employee_id,
              company: user.company,
              department: user.department,
              division: user.division,
              role: user.role,
              avatar_url: user.avatar_url,
            });

          if (createProfileError) {
            console.error('Error creating profile:', createProfileError);
            // ไม่ต้อง throw error เพราะอาจจะเป็นปัญหาของ RLS
          }
        }
      }

      if (isEditMode && request) {
        console.log('Updating existing request:', id);
        
        const { error } = await supabase
          .from('requests')
          .update(apiData)
          .eq('id', id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        toast.success('แก้ไขคำขอเรียบร้อย');
        navigate(`/request/${id}`);
      } else {
        console.log('Creating new request');
        
        const { data, error } = await supabase
          .from('requests')
          .insert([apiData])
          .select()
          .single();

        if (error) {
          console.error('Insert error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
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
        errorMessage = 'ไม่มีสิทธิ์ในการบันทึกข้อมูล - ตรวจสอบการตั้งค่า RLS policies';
        console.error('RLS Policy Error - Mock user ID:', user.id);
        console.error('Mock user detection:', user.name?.startsWith('Test '));
      } else if (error?.message?.includes('violates row-level security')) {
        errorMessage = 'การตั้งค่าความปลอดภัยของระบบไม่อนุญาตให้บันทึกข้อมูล';
        console.error('RLS Violation - User ID:', user.id);
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
                ID: {user.id} | Type: {user.name?.startsWith('Test ') ? 'Mock User' : 'Real User'}
              </p>
              <p className="text-xs text-green-600">
                RLS Ready: {user.id && ['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'].includes(user.id) ? 'Yes' : 'No'}
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
