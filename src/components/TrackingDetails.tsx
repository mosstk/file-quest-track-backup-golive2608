
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileRequest } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface TrackingDetailsProps {
  request: FileRequest;
  onConfirmDelivery?: () => void;
}

const TrackingDetails: React.FC<TrackingDetailsProps> = ({ 
  request,
  onConfirmDelivery 
}) => {
  const { user } = useAuth();
  const isReceiver = user?.email === request.receiverEmail;
  const canConfirm = isReceiver && request.status === 'approved' && !request.isDelivered;

  const handleConfirmDelivery = () => {
    if (onConfirmDelivery) {
      onConfirmDelivery();
    } else {
      toast.success("ยืนยันการได้รับเอกสารเรียบร้อย");
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">ข้อมูลการจัดส่ง</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">สถานะการส่ง:</span>
            <span className={`font-medium ${request.isDelivered ? 'text-green-600' : 'text-blue-600'}`}>
              {request.isDelivered ? 'ได้รับเอกสารแล้ว' : 'กำลังจัดส่ง'}
            </span>
          </div>
          
          {request.trackingNumber && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">เลขพัสดุ:</span>
              <span className="font-medium">{request.trackingNumber}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">ผู้รับ:</span>
            <span className="font-medium">{request.receiverEmail}</span>
          </div>
        </div>
        
        {canConfirm && (
          <div className="pt-2">
            <Button 
              onClick={handleConfirmDelivery} 
              className="w-full"
            >
              ยืนยันการได้รับเอกสาร
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrackingDetails;
