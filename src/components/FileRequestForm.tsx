import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileRequest } from '@/types';
import { Loader2 } from 'lucide-react';

interface FileRequestFormProps {
  request?: FileRequest;
  onSuccess: () => void;
}

const FileRequestForm: React.FC<FileRequestFormProps> = ({ request, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    documentName: '',
    receiverEmail: '',
    documentDescription: ''
  });

  useEffect(() => {
    if (request) {
      setFormData({
        documentName: request.document_name || request.documentName || '',
        receiverEmail: request.receiver_email || request.receiverEmail || '',
        documentDescription: ''
      });
    }
  }, [request]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.documentName.trim()) {
      setError('กรุณากรอกชื่อเอกสาร');
      return false;
    }
    if (!formData.receiverEmail.trim()) {
      setError('กรุณากรอกอีเมลผู้รับ');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.receiverEmail)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('User:', user);
    console.log('Form data:', formData);
    
    if (!validateForm()) return;
    if (!user) {
      console.log('No user found');
      setError('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const requestData = {
        document_name: formData.documentName,
        receiver_email: formData.receiverEmail,
        file_path: formData.documentDescription, // Store description in file_path for now
        requester_id: user.id,
        status: 'pending' as const
      };
      
      console.log('Request data to insert:', requestData);

      let result;
      
      if (request) {
        // Update existing request
        result = await supabase
          .from('requests')
          .update(requestData)
          .eq('id', request.id)
          .select()
          .single();
      } else {
        // Create new request
        result = await supabase
          .from('requests')
          .insert(requestData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving request:', result.error);
        throw new Error('ไม่สามารถบันทึกคำขอได้');
      }

      toast.success(request ? 'แก้ไขคำขอเรียบร้อย' : 'สร้างคำขอเรียบร้อย');
      onSuccess();
      
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      toast.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{request ? 'แก้ไขคำขอส่งไฟล์' : 'สร้างคำขอส่งไฟล์ใหม่'}</CardTitle>
        <CardDescription>
          กรอกข้อมูลและแนบไฟล์ที่ต้องการส่ง
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentName">ชื่อเอกสาร *</Label>
            <Input
              id="documentName"
              name="documentName"
              value={formData.documentName}
              onChange={handleInputChange}
              placeholder="ระบุชื่อเอกสารที่ต้องการส่ง"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentDescription">รายละเอียดไฟล์</Label>
            <Textarea
              id="documentDescription"
              name="documentDescription"
              value={formData.documentDescription}
              onChange={handleInputChange}
              placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับไฟล์ (ไม่บังคับ)"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiverEmail">อีเมลผู้รับ *</Label>
            <Input
              id="receiverEmail"
              name="receiverEmail"
              type="email"
              value={formData.receiverEmail}
              onChange={handleInputChange}
              placeholder="user@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {request ? 'บันทึกการแก้ไข' : 'สร้างคำขอ'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FileRequestForm;