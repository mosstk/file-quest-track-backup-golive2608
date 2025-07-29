import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    documentDescription: '',
    documentCount: '',
    receiverName: '',
    receiverDepartment: '',
    countryName: '',
    receiverCompany: '',
    receiverPhone: ''
  });

  useEffect(() => {
    if (request) {
      setFormData({
        documentName: request.document_name || request.documentName || '',
        receiverEmail: request.receiver_email || request.receiverEmail || '',
        documentDescription: '',
        documentCount: '',
        receiverName: '',
        receiverDepartment: '',
        countryName: '',
        receiverCompany: '',
        receiverPhone: ''
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const countries = [
    'Thailand', 'Vietnam', 'Laos', 'Malaysia', 'Indonesia', 'Myanmar', 'Cambodia', 'United States'
  ];

  const companies = [
    'TOA Paint (Vietnam) CO.,Ltd.',
    'TOA Paint (LAOS) SOLE CO.,LTD.',
    'TOA Coating Sdn. Bhd.',
    'TOA Paint Products Sdn. Bhd.',
    'PT TOA Coating Indonesia',
    'PT TOA Paint Indonesia',
    'TOA COATING (MYANMAR) CO.,LTD.',
    'TOA PAINT (MYANMAR) CO.,LTD.',
    'TOA COATING (CAMBODIA)'
  ];

  const validateForm = () => {
    if (!formData.documentName.trim()) {
      setError('กรุณากรอกชื่อเอกสาร');
      return false;
    }
    if (!formData.receiverEmail.trim()) {
      setError('กรุณากรอกอีเมลผู้รับ');
      return false;
    }
    if (!formData.documentCount.trim()) {
      setError('กรุณากรอกจำนวนเอกสารที่ฝากส่ง');
      return false;
    }
    if (!formData.receiverName.trim()) {
      setError('กรุณากรอกชื่อของผู้รับเอกสาร');
      return false;
    }
    if (!formData.receiverDepartment.trim()) {
      setError('กรุณากรอกฝ่ายของผู้รับเอกสาร');
      return false;
    }
    if (!formData.countryName.trim()) {
      setError('กรุณากรอกชื่อประเทศ');
      return false;
    }
    if (!formData.receiverCompany.trim()) {
      setError('กรุณากรอกชื่อบริษัทผู้รับ');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.receiverEmail)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }

    // Document count validation (must be number and greater than 0)
    const docCount = parseInt(formData.documentCount);
    if (isNaN(docCount) || docCount <= 0) {
      setError('จำนวนเอกสารต้องเป็นตัวเลขและมากกว่า 0');
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
        // Update existing request - ยังคงใช้วิธีเดิม
        result = await supabase
          .from('requests')
          .update({
            document_name: formData.documentName,
            receiver_email: formData.receiverEmail,
            file_path: formData.documentDescription
          })
          .eq('id', request.id)
          .select()
          .single();
      } else {
        // Create new request - ใช้ function
        const { data, error } = await supabase.rpc('create_request', {
          p_document_name: formData.documentName,
          p_receiver_email: formData.receiverEmail,
          p_file_path: formData.documentDescription,
          p_requester_id: user.id,
          p_document_count: parseInt(formData.documentCount),
          p_receiver_name: formData.receiverName,
          p_receiver_department: formData.receiverDepartment,
          p_country_name: formData.countryName,
          p_receiver_company: formData.receiverCompany,
          p_receiver_phone: formData.receiverPhone
        });

        if (error) {
          throw error;
        }

        // ตรวจสอบว่า data มี error หรือไม่
        if (data && typeof data === 'object' && 'error' in data) {
          throw new Error(String(data.error));
        }

        result = { data, error: null };
        
        // Send notification email for new requests
        try {
          const requestRecord = data as any;
          await supabase.functions.invoke('send-request-notification', {
            body: {
              requestId: requestRecord?.id || 'unknown',
              requestData: {
                document_name: formData.documentName,
                receiver_email: formData.receiverEmail,
                receiver_name: formData.receiverName,
                requester_name: user.full_name || user.name,
                requester_email: user.email
              }
            }
          });
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
          // Don't throw here - request was created successfully
        }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">
              {request ? 'แก้ไขคำขอส่งไฟล์' : 'สร้างคำขอส่งไฟล์ใหม่'}
            </CardTitle>
            <CardDescription className="text-blue-100 text-center">
              กรอกข้อมูลและแนบไฟล์ที่ต้องการส่ง
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50 animate-fade-in">
                <AlertDescription className="text-red-800 font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Document Information Section */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-2 h-6 bg-blue-500 rounded mr-3"></div>
                  ข้อมูลเอกสาร
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="documentName" className="text-gray-700 font-medium">ชื่อเอกสาร *</Label>
                    <Input
                      id="documentName"
                      name="documentName"
                      value={formData.documentName}
                      onChange={handleInputChange}
                      placeholder="ระบุชื่อเอกสารที่ต้องการส่ง"
                      required
                      disabled={isSubmitting}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentCount" className="text-gray-700 font-medium">จำนวนเอกสารที่ฝากส่ง *</Label>
                    <Input
                      id="documentCount"
                      name="documentCount"
                      type="number"
                      min="1"
                      value={formData.documentCount}
                      onChange={handleInputChange}
                      placeholder="จำนวนเอกสาร"
                      required
                      disabled={isSubmitting}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Label htmlFor="documentDescription" className="text-gray-700 font-medium">รายละเอียดไฟล์</Label>
                  <Textarea
                    id="documentDescription"
                    name="documentDescription"
                    value={formData.documentDescription}
                    onChange={handleInputChange}
                    placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับไฟล์ (ไม่บังคับ)"
                    disabled={isSubmitting}
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Receiver Information Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-2 h-6 bg-green-500 rounded mr-3"></div>
                  ข้อมูลผู้รับ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="receiverName" className="text-gray-700 font-medium">ชื่อผู้รับเอกสาร *</Label>
                    <Input
                      id="receiverName"
                      name="receiverName"
                      value={formData.receiverName}
                      onChange={handleInputChange}
                      placeholder="ชื่อผู้รับ"
                      required
                      disabled={isSubmitting}
                      className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="countryName" className="text-gray-700 font-medium">ประเทศ *</Label>
                    <Select 
                      value={formData.countryName} 
                      onValueChange={(value) => handleSelectChange('countryName', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="เลือกประเทศ" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiverCompany" className="text-gray-700 font-medium">ชื่อบริษัท *</Label>
                    <Select 
                      value={formData.receiverCompany} 
                      onValueChange={(value) => handleSelectChange('receiverCompany', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="เลือกบริษัท" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60">
                        {companies.map((company) => (
                          <SelectItem key={company} value={company}>
                            {company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiverDepartment" className="text-gray-700 font-medium">ฝ่าย/แผนก *</Label>
                    <Input
                      id="receiverDepartment"
                      name="receiverDepartment"
                      value={formData.receiverDepartment}
                      onChange={handleInputChange}
                      placeholder="ฝ่าย/แผนก"
                      required
                      disabled={isSubmitting}
                      className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiverEmail" className="text-gray-700 font-medium">อีเมล *</Label>
                    <Input
                      id="receiverEmail"
                      name="receiverEmail"
                      type="email"
                      value={formData.receiverEmail}
                      onChange={handleInputChange}
                      placeholder="user@example.com"
                      required
                      disabled={isSubmitting}
                      className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Label htmlFor="receiverPhone" className="text-gray-700 font-medium">เบอร์โทร</Label>
                  <Input
                    id="receiverPhone"
                    name="receiverPhone"
                    type="tel"
                    value={formData.receiverPhone || ''}
                    onChange={handleInputChange}
                    placeholder="หมายเลขโทรศัพท์"
                    disabled={isSubmitting}
                    className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  disabled={isSubmitting}
                  className="flex-1 h-12 border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {request ? 'บันทึกการแก้ไข' : 'สร้างคำขอ'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FileRequestForm;