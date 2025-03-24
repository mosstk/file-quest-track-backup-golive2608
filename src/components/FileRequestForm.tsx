
import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface FileRequestFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isRework?: boolean;
}

const FileRequestForm: React.FC<FileRequestFormProps> = ({ 
  onSubmit, 
  initialData = {}, 
  isRework = false 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    requesterName: initialData.requesterName || user?.name || '',
    requesterEmployeeId: initialData.requesterEmployeeId || user?.employeeId || '',
    requesterCompany: initialData.requesterCompany || user?.company || '',
    requesterDepartment: initialData.requesterDepartment || user?.department || '',
    requesterDivision: initialData.requesterDivision || user?.division || '',
    documentName: initialData.documentName || '',
    requesterEmail: initialData.requesterEmail || user?.email || '',
    receiverEmail: initialData.receiverEmail || '',
    fileAttachment: initialData.fileAttachment || null,
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
      if (formErrors.fileAttachment) {
        setFormErrors({
          ...formErrors,
          fileAttachment: '',
        });
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.requesterName.trim()) errors.requesterName = 'กรุณาระบุชื่อผู้ส่ง';
    if (!formData.requesterEmployeeId.trim()) errors.requesterEmployeeId = 'กรุณาระบุรหัสพนักงาน';
    if (!formData.requesterCompany.trim()) errors.requesterCompany = 'กรุณาระบุบริษัท';
    if (!formData.requesterDepartment.trim()) errors.requesterDepartment = 'กรุณาระบุฝ่าย';
    if (!formData.requesterDivision.trim()) errors.requesterDivision = 'กรุณาระบุแผนก';
    if (!formData.documentName.trim()) errors.documentName = 'กรุณาระบุชื่อเอกสาร';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.requesterEmail.trim()) {
      errors.requesterEmail = 'กรุณาระบุอีเมลผู้ส่ง';
    } else if (!emailRegex.test(formData.requesterEmail)) {
      errors.requesterEmail = 'กรุณาระบุอีเมลให้ถูกต้อง';
    }
    
    if (!formData.receiverEmail.trim()) {
      errors.receiverEmail = 'กรุณาระบุอีเมลผู้รับ';
    } else if (!emailRegex.test(formData.receiverEmail)) {
      errors.receiverEmail = 'กรุณาระบุอีเมลให้ถูกต้อง';
    }
    
    if (!initialData.fileAttachment && !fileSelected && !isRework) {
      errors.fileAttachment = 'กรุณาแนบไฟล์';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      fileAttachment: fileSelected ? fileSelected.name : formData.fileAttachment,
    };
    
    onSubmit(submitData);
  };

  const handleCancel = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requesterName">ชื่อ-นามสกุล</Label>
              <Input
                id="requesterName"
                name="requesterName"
                value={formData.requesterName}
                onChange={handleInputChange}
                className={formErrors.requesterName ? 'border-red-500' : ''}
              />
              {formErrors.requesterName && (
                <p className="text-sm text-red-500">{formErrors.requesterName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requesterEmployeeId">รหัสพนักงาน</Label>
              <Input
                id="requesterEmployeeId"
                name="requesterEmployeeId"
                value={formData.requesterEmployeeId}
                onChange={handleInputChange}
                className={formErrors.requesterEmployeeId ? 'border-red-500' : ''}
              />
              {formErrors.requesterEmployeeId && (
                <p className="text-sm text-red-500">{formErrors.requesterEmployeeId}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requesterCompany">บริษัท</Label>
            <Input
              id="requesterCompany"
              name="requesterCompany"
              value={formData.requesterCompany}
              onChange={handleInputChange}
              className={formErrors.requesterCompany ? 'border-red-500' : ''}
            />
            {formErrors.requesterCompany && (
              <p className="text-sm text-red-500">{formErrors.requesterCompany}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requesterDepartment">ฝ่าย</Label>
              <Input
                id="requesterDepartment"
                name="requesterDepartment"
                value={formData.requesterDepartment}
                onChange={handleInputChange}
                className={formErrors.requesterDepartment ? 'border-red-500' : ''}
              />
              {formErrors.requesterDepartment && (
                <p className="text-sm text-red-500">{formErrors.requesterDepartment}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requesterDivision">แผนก</Label>
              <Input
                id="requesterDivision"
                name="requesterDivision"
                value={formData.requesterDivision}
                onChange={handleInputChange}
                className={formErrors.requesterDivision ? 'border-red-500' : ''}
              />
              {formErrors.requesterDivision && (
                <p className="text-sm text-red-500">{formErrors.requesterDivision}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentName">ชื่อไฟล์เอกสาร</Label>
            <Input
              id="documentName"
              name="documentName"
              value={formData.documentName}
              onChange={handleInputChange}
              className={formErrors.documentName ? 'border-red-500' : ''}
            />
            {formErrors.documentName && (
              <p className="text-sm text-red-500">{formErrors.documentName}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requesterEmail">อีเมล์ของผู้ส่ง</Label>
              <Input
                id="requesterEmail"
                name="requesterEmail"
                type="email"
                value={formData.requesterEmail}
                onChange={handleInputChange}
                className={formErrors.requesterEmail ? 'border-red-500' : ''}
              />
              {formErrors.requesterEmail && (
                <p className="text-sm text-red-500">{formErrors.requesterEmail}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receiverEmail">อีเมล์ของผู้รับ</Label>
              <Input
                id="receiverEmail"
                name="receiverEmail"
                type="email"
                value={formData.receiverEmail}
                onChange={handleInputChange}
                className={formErrors.receiverEmail ? 'border-red-500' : ''}
              />
              {formErrors.receiverEmail && (
                <p className="text-sm text-red-500">{formErrors.receiverEmail}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fileAttachment">ไฟล์แนบ</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fileAttachment"
                name="fileAttachment"
                type="file"
                onChange={handleFileChange}
                className={`${formErrors.fileAttachment ? 'border-red-500' : ''} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90`}
              />
            </div>
            {formErrors.fileAttachment && (
              <p className="text-sm text-red-500">{formErrors.fileAttachment}</p>
            )}
            {(initialData.fileAttachment || fileSelected) && (
              <p className="text-sm text-muted-foreground">
                ไฟล์ที่เลือก: {fileSelected ? fileSelected.name : initialData.fileAttachment}
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
          >
            ยกเลิก
          </Button>
          <Button 
            type="submit" 
            className="transition-all"
          >
            ตกลง
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FileRequestForm;
