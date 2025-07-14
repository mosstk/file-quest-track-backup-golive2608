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

        if (error) {
          console.error('Error fetching request:', error);
          throw error;
        }
        
        if (data) {
          setRequest(normalizeFileRequest(data));
        }
      } catch (error) {
        console.error('Error fetching request:', error);
        toast.error('ไม่สามารถโหลดข้อมูลคำขอได้');
        navigate('/requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, isEditMode, user, navigate]);

  const handleSuccess = () => {
    toast.success(isEditMode ? 'แก้ไขคำขอเรียบร้อย' : 'สร้างคำขอเรียบร้อย');
    navigate('/requests');
  };

  if (loading) {
    return (
      <Layout requireAuth allowedRoles={['requester', 'fa_admin']}>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-primary">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth allowedRoles={['requester', 'fa_admin']}>
      <div className="container py-8 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <FileRequestForm 
            request={isEditMode ? request || undefined : undefined}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CreateEditRequest;