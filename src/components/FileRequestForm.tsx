
import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { FileRequest } from '@/types';

interface FileRequestFormProps {
  onSubmit: (data: Partial<FileRequest>) => void;
  initialData?: Partial<FileRequest>;
  isRework?: boolean;
  disabled?: boolean;
}

const FileRequestForm: React.FC<FileRequestFormProps> = ({ 
  onSubmit, 
  initialData = {}, 
  isRework = false,
  disabled = false
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    document_name: initialData.document_name || initialData.documentName || '',
    receiver_email: initialData.receiver_email || initialData.receiverEmail || '',
    file_path: initialData.file_path || initialData.fileAttachment || null,
  });

  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileSelected(e.target.files[0]);
      
      // Clear file error if previously set
      if (formErrors.file_path) {
        setFormErrors({
          ...formErrors,
          file_path: '',
        });
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.document_name?.trim()) errors.document_name = 'กรุณาระบุชื่อเอกสาร';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.receiver_email?.trim()) {
      errors.receiver_email = 'กรุณาระบุอีเมลผู้รับ';
    } else if (!emailRegex.test(formData.receiver_email)) {
      errors.receiver_email = 'กรุณาระบุอีเมลให้ถูกต้อง';
    }
    
    if (!initialData.file_path && !fileSelected && !isRework) {
      errors.file_path = 'กรุณาแนบไฟล์';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled) return;
    
    if (!validateForm()) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    console.log('Form submission with data:', formData);
    console.log('Current user in form:', user);
    
    onSubmit({
      document_name: formData.document_name,
      receiver_email: formData.receiver_email,
      file_path: fileSelected ? fileSelected.name : formData.file_path,
    });
  };

  const handleCancel = () => {
    if (disabled) return;
    
    toast.info('ยกเลิกการทำรายการ');
    window.history.back();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md animate-scale">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{isRework ? 'แก้ไขคำขอส่งไฟล์' : 'ใบคำขอส่งไฟล์'}</CardTitle>
        <CardDescription>
          กรุณากรอกข้อมูลให้ครบถ้วนเพื่อดำเนินการต่อ
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          
          <div className="space-y-2">
            <Label htmlFor="document_name">ชื่อไฟล์เอกสาร</Label>
            <Input
              id="document_name"
              name="document_name"
              value={formData.document_name}
              onChange={handleInputChange}
              className={formErrors.document_name ? 'border-red-500' : ''}
              disabled={disabled}
            />
            {formErrors.document_name && (
              <p className="text-sm text-red-500">{formErrors.document_name}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <Label htmlFor="receiver_email">อีเมล์ของผู้รับ</Label>
              <Input
                id="receiver_email"
                name="receiver_email"
                type="email"
                value={formData.receiver_email}
                onChange={handleInputChange}
                className={formErrors.receiver_email ? 'border-red-500' : ''}
                disabled={disabled}
              />
              {formErrors.receiver_email && (
                <p className="text-sm text-red-500">{formErrors.receiver_email}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file_path">ไฟล์แนบ</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file_path"
                name="file_path"
                type="file"
                onChange={handleFileChange}
                className={`${formErrors.file_path ? 'border-red-500' : ''} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90`}
                disabled={disabled}
              />
            </div>
            {formErrors.file_path && (
              <p className="text-sm text-red-500">{formErrors.file_path}</p>
            )}
            {(initialData.file_path || fileSelected) && (
              <p className="text-sm text-muted-foreground">
                ไฟล์ที่เลือก: {fileSelected ? fileSelected.name : initialData.file_path}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            className="transition-all hover:bg-destructive/10"
            disabled={disabled}
          >
            ยกเลิก
          </Button>
          <Button 
            type="submit" 
            className="transition-all"
            disabled={disabled}
          >
            {disabled ? 'กำลังบันทึก...' : 'ตกลง'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FileRequestForm;
