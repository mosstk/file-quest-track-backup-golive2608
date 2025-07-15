import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import RequestStatusBadge from '@/components/RequestStatusBadge';
import ApprovalForm from '@/components/ApprovalForm';
import TrackingDetails from '@/components/TrackingDetails';
import { FileRequest } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { normalizeFileRequest } from '@/lib/utils/formatters';

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<FileRequest | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchRequest = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch request using get_all_requests function for admin access
      const { data: allRequests, error } = await supabase
        .rpc('get_all_requests');
      
      if (error) {
        console.error('Error fetching requests:', error);
        toast.error('ไม่สามารถโหลดข้อมูลคำขอได้');
        return;
      }
      
      // Find the specific request by ID
      const requestData = allRequests?.find((req: any) => req.id === id);
      
      if (requestData) {
        console.log('Raw request data from database:', requestData);
        const normalizedRequest = normalizeFileRequest(requestData);
        console.log('Normalized request data:', normalizedRequest);
        setRequest(normalizedRequest);
      } else {
        toast.error('ไม่พบคำขอที่ต้องการ');
      }
      
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleApprove = async (trackingNumber: string) => {
    if (!request) return;
    
    console.log('Approving request:', request.id);
    console.log('User:', user);
    console.log('Tracking number:', trackingNumber);
    
    try {
      // Update request in database
      const updateData = {
        status: 'approved' as const,
        tracking_number: trackingNumber,
        updated_at: new Date().toISOString(),
        approved_by: user?.id
      };
      
      console.log('Update data:', updateData);
      
      const { error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', request.id);
      
      if (error) {
        console.error('Supabase error:', error);
        toast.error('ไม่สามารถอนุมัติคำขอได้: ' + error.message);
        return;
      }
      
      // Update local state
      setRequest({
        ...request,
        status: 'approved',
        tracking_number: trackingNumber,
        trackingNumber,
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Force re-fetch to ensure UI updates
      await fetchRequest();
      
      toast.success('อนุมัติคำขอเรียบร้อย');
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติคำขอ');
    }
  };
  
  const handleRework = async (feedback: string) => {
    if (!request) return;
    
    try {
      // Update request in database
      const { error } = await supabase
        .from('requests')
        .update({
          status: 'rework',
          admin_feedback: feedback,
          updated_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', request.id);
      
      if (error) {
        console.error('Error requesting rework:', error);
        toast.error('ไม่สามารถส่งคำขอแก้ไขได้');
        return;
      }
      
      // Update local state
      setRequest({
        ...request,
        status: 'rework',
        admin_feedback: feedback,
        adminFeedback: feedback,
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      toast.success('ส่งคำขอแก้ไขเรียบร้อย');
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งคำขอแก้ไข');
    }
  };
  
  const handleReject = async (feedback: string) => {
    if (!request) return;
    
    try {
      // Update request in database
      const { error } = await supabase
        .from('requests')
        .update({
          status: 'rejected',
          admin_feedback: feedback,
          updated_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', request.id);
      
      if (error) {
        console.error('Error rejecting request:', error);
        toast.error('ไม่สามารถปฏิเสธคำขอได้');
        return;
      }
      
      // Update local state
      setRequest({
        ...request,
        status: 'rejected',
        admin_feedback: feedback,
        adminFeedback: feedback,
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      toast.success('ปฏิเสธคำขอเรียบร้อย');
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธคำขอ');
    }
  };
  
  const handleConfirmDelivery = async () => {
    if (!request) return;
    
    try {
      // Update request in database
      const { error } = await supabase
        .from('requests')
        .update({
          is_delivered: true,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);
      
      if (error) {
        console.error('Error confirming delivery:', error);
        toast.error('ไม่สามารถยืนยันการได้รับเอกสารได้');
        return;
      }
      
      // Update local state
      setRequest({
        ...request,
        is_delivered: true,
        isDelivered: true,
        status: 'completed',
        updated_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      toast.success('ยืนยันการได้รับเอกสารเรียบร้อย');
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการยืนยันการได้รับเอกสาร');
    }
  };
  
  const handleEditRequest = () => {
    navigate(`/requests/edit/${id}`);
  };
  
  if (loading) {
    return (
      <Layout requireAuth>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-primary">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!request) {
    return (
      <Layout requireAuth>
        <div className="container py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">ไม่พบข้อมูลคำขอ</h1>
              <p className="text-muted-foreground mb-4">ไม่พบคำขอที่คุณกำลังค้นหา</p>
              <Button onClick={() => navigate(-1)}>กลับ</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  const isAdmin = user?.role === 'fa_admin';
  const isRequester = user?.email === request.requesterEmail;
  const isReceiver = user?.email === (request.receiver_email || request.receiverEmail);
  const canApprove = isAdmin && request.status === 'pending';
  const canEdit = (isRequester && request.status === 'rework') || isAdmin;

  return (
    <Layout requireAuth>
      <div className="container py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-2"
            >
              &larr; กลับ
            </Button>
            <h1 className="text-2xl font-bold">{request.document_name || request.documentName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                คำขอส่งไฟล์ #{request.id}
              </p>
              <RequestStatusBadge status={request.status} />
            </div>
          </div>
          
          {canEdit && (
            <Button onClick={handleEditRequest}>
              แก้ไขคำขอ
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>รายละเอียดคำขอ</CardTitle>
                <CardDescription>ข้อมูลคำขอส่งไฟล์</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">ผู้ส่ง</h3>
                    <p className="font-medium">{request.requesterName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">รหัสพนักงาน</h3>
                    <p className="font-medium">{request.requesterEmployeeId}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">บริษัท</h3>
                  <p className="font-medium">{request.requesterCompany}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">ฝ่าย</h3>
                    <p className="font-medium">{request.requesterDepartment}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">แผนก</h3>
                    <p className="font-medium">{request.requesterDivision}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">ชื่อไฟล์เอกสาร</h3>
                  <p className="font-medium">{request.document_name || request.documentName}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">อีเมล์ของผู้ส่ง</h3>
                    <p className="font-medium">{request.requesterEmail}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">อีเมล์ของผู้รับ</h3>
                    <p className="font-medium">{request.receiver_email || request.receiverEmail}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">ไฟล์แนบ</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-muted/50">
                      {request.file_path || request.fileAttachment}
                    </Badge>
                    <Button variant="outline" size="sm">
                      ดาวน์โหลด
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">วันที่สร้าง</h3>
                    <p className="font-medium">{formatDate(request.created_at || request.createdAt || '')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">อัปเดตล่าสุด</h3>
                    <p className="font-medium">{formatDate(request.updated_at || request.updatedAt || '')}</p>
                  </div>
                </div>
                
                {(request.admin_feedback || request.adminFeedback) && (
                  <Alert className={`mt-2 ${
                    request.status === 'rejected' 
                      ? 'border-red-200 bg-red-50 text-red-800' 
                      : 'border-amber-200 bg-amber-50 text-amber-800'
                  }`}>
                    <AlertTitle>
                      {request.status === 'rejected' 
                        ? 'เหตุผลในการปฏิเสธ' 
                        : 'ข้อมูลที่ต้องแก้ไข'
                      }
                    </AlertTitle>
                    <AlertDescription>
                      {request.admin_feedback || request.adminFeedback}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            {canApprove && (
              <ApprovalForm 
                request={request}
                onApprove={handleApprove}
                onRework={handleRework}
                onReject={handleReject}
              />
            )}
          </div>
          
          <div className="space-y-6">
            {(request.status === 'approved' || request.status === 'completed') && (
              <TrackingDetails 
                request={request}
                onConfirmDelivery={isReceiver ? handleConfirmDelivery : undefined}
              />
            )}
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">ประวัติการเปลี่ยนแปลง</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">สร้างคำขอส่งไฟล์</p>
                      <p className="text-sm text-muted-foreground">{formatDate(request.created_at || request.createdAt || '')}</p>
                    </div>
                  </div>
                  
                  {request.status !== 'pending' && (
                    <div className="flex items-start gap-3">
                      <div className={`h-2 w-2 rounded-full mt-2 ${
                        request.status === 'approved' || request.status === 'completed'
                          ? 'bg-green-500'
                          : request.status === 'rework'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {request.status === 'approved' 
                            ? 'คำขอได้รับการอนุมัติ'
                            : request.status === 'rework'
                              ? 'คำขอต้องได้รับการแก้ไข'
                              : request.status === 'rejected'
                                ? 'คำขอถูกปฏิเสธ'
                                : 'เสร็จสิ้น'
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">{formatDate(request.updated_at || request.updatedAt || '')}</p>
                      </div>
                    </div>
                  )}
                  
                  {request.status === 'completed' && (
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">ได้รับเอกสารเรียบร้อย</p>
                        <p className="text-sm text-muted-foreground">{formatDate(request.updated_at || request.updatedAt || '')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequestDetail;
