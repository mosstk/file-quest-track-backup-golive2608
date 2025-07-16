
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { FileRequest } from '@/types';

interface ApprovalFormProps {
  request: FileRequest;
  onApprove: (trackingNumber: string) => void;
  onRework: (feedback: string) => void;
  onReject: (feedback: string) => void;
}

const ApprovalForm: React.FC<ApprovalFormProps> = ({
  request,
  onApprove,
  onRework,
  onReject,
}) => {
  const [action, setAction] = useState<'approve' | 'rework' | 'reject' | ''>('');
  const [feedback, setFeedback] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!action) {
      setError('กรุณาเลือกการดำเนินการ');
      return;
    }

    if (action === 'approve') {
      if (!trackingNumber.trim()) {
        setError('กรุณาระบุเลขพัสดุ');
        return;
      }
      onApprove(trackingNumber);
    } else if (action === 'rework' || action === 'reject') {
      if (!feedback.trim()) {
        setError('กรุณาระบุข้อมูลเพิ่มเติม');
        return;
      }
      
      if (action === 'rework') {
        onRework(feedback);
      } else {
        onReject(feedback);
      }
    }
  };

  const handleActionChange = (value: string) => {
    setAction(value as 'approve' | 'rework' | 'reject');
    setError('');
  };

  return (
    <Card className="w-full max-w-lg shadow-md animate-scale">
      <CardHeader>
        <CardTitle>ดำเนินการคำขอส่งไฟล์</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base">เลือกการดำเนินการ</Label>
            <RadioGroup value={action} onValueChange={handleActionChange} className="space-y-2">
              <div className="flex items-center space-x-2 rounded-md border p-3 transition-all hover:bg-secondary">
                <RadioGroupItem value="approve" id="approve" />
                <Label htmlFor="approve" className="font-normal cursor-pointer flex-1">อนุมัติ</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3 transition-all hover:bg-secondary">
                <RadioGroupItem value="rework" id="rework" />
                <Label htmlFor="rework" className="font-normal cursor-pointer flex-1">ขอแก้ไข</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3 transition-all hover:bg-secondary">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject" className="font-normal cursor-pointer flex-1">ปฏิเสธ</Label>
              </div>
            </RadioGroup>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {action === 'approve' && (
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">เลขพัสดุ (Tracking Number)</Label>
              <Input
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="กรุณาระบุเลขพัสดุ"
              />
            </div>
          )}

          {(action === 'rework' || action === 'reject') && (
            <div className="space-y-2">
              <Label htmlFor="feedback">ข้อมูลเพิ่มเติม</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  action === 'rework' 
                    ? "ระบุรายละเอียดที่ต้องการให้แก้ไข" 
                    : "ระบุเหตุผลในการปฏิเสธ"
                }
                rows={4}
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            ยกเลิก
          </Button>
          <Button type="submit">ยืนยัน</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ApprovalForm;
