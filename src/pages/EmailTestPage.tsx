import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Send } from 'lucide-react';
import Layout from '@/components/Layout';

const EmailTestPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState({
    testEmails: 'apichai_t@toagroup.com, webmaster.stf@gmail.com',
    documentName: 'ทดสอบระบบส่งอีเมล์',
    receiverName: 'ผู้ทดสอบ',
    requesterName: 'ระบบทดสอบ'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendTestEmail = async () => {
    setIsLoading(true);
    
    try {
      const emails = testData.testEmails.split(',').map(email => email.trim());
      
      const testRequestData = {
        requestId: 'test-' + Date.now(),
        requestData: {
          document_name: testData.documentName,
          receiver_email: emails[0], // Primary receiver
          receiver_name: testData.receiverName,
          requester_name: testData.requesterName,
          requester_email: emails[1] || emails[0] // Secondary or same as primary
        }
      };

      console.log('Sending test email with data:', testRequestData);
      
      const { data, error } = await supabase.functions.invoke('send-request-notification', {
        body: testRequestData
      });

      if (error) {
        throw error;
      }

      console.log('Email response:', data);
      toast.success(`ส่งอีเมล์ทดสอบเรียบร้อยแล้ว ไปยัง: ${testData.testEmails}`);
      
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout requireAuth allowedRoles={['fa_admin']}>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6" />
                ทดสอบระบบส่งอีเมล์แจ้งเตือน
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="testEmails">อีเมล์ที่ต้องการทดสอบ</Label>
                <Input
                  id="testEmails"
                  name="testEmails"
                  value={testData.testEmails}
                  onChange={handleInputChange}
                  placeholder="email1@example.com, email2@example.com"
                  className="h-12"
                />
                <p className="text-sm text-gray-500">
                  แยกหลายอีเมล์ด้วยเครื่องหมายจุลภาค (,)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentName">ชื่อเอกสารทดสอบ</Label>
                <Input
                  id="documentName"
                  name="documentName"
                  value={testData.documentName}
                  onChange={handleInputChange}
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiverName">ชื่อผู้รับทดสอบ</Label>
                  <Input
                    id="receiverName"
                    name="receiverName"
                    value={testData.receiverName}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requesterName">ชื่อผู้ขอทดสอบ</Label>
                  <Input
                    id="requesterName"
                    name="requesterName"
                    value={testData.requesterName}
                    onChange={handleInputChange}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">ข้อมูลการทดสอบ:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• อีเมล์จะถูกส่งไปยังที่อยู่ที่ระบุ</li>
                  <li>• ระบบจะส่งไปยัง Admin ทุกคนในระบบด้วย</li>
                  <li>• ตรวจสอบ spam folder หากไม่เจออีเมล์</li>
                </ul>
              </div>

              <Button
                onClick={sendTestEmail}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'กำลังส่งอีเมล์...' : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    ส่งอีเมล์ทดสอบ
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EmailTestPage;