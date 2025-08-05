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
  
  const handleApprove = async (trackingNumber: string, shippingVendor: string) => {
    if (!request || !user?.id) return;
    
    console.log('Approving request:', request.id);
    console.log('User:', user);
    console.log('Tracking number:', trackingNumber);
    console.log('Shipping vendor:', shippingVendor);
    
    try {
      // ใช้ database function ใหม่สำหรับการอนุมัติ
      const { data: result, error } = await supabase
        .rpc('approve_request', {
          p_request_id: request.id,
          p_tracking_number: trackingNumber,
          p_admin_id: user.id,
          p_shipping_vendor: shippingVendor
        });
      
      if (error) {
        console.error('Supabase error:', error);
        toast.error('ไม่สามารถอนุมัติคำขอได้: ' + error.message);
        return;
      }
      
      console.log('Approval result:', result);
      
      // Type cast for result
      const typedResult = result as { success: boolean; error?: string; message?: string };
      
      if (!typedResult.success) {
        toast.error('ไม่สามารถอนุมัติคำขอได้: ' + typedResult.error);
        return;
      }
      
      // Force re-fetch to ensure UI updates
      await fetchRequest();
      
      // Send approval notification email
      try {
        await supabase.functions.invoke('send-approval-notification', {
          body: {
            requestId: request.id,
            requestData: {
              document_name: request.document_name || request.documentName,
              receiver_email: request.receiver_email || request.receiverEmail,
              receiver_name: request.receiver_name || request.receiverName,
              requester_name: request.requesterName,
              requester_email: request.requesterEmail,
              tracking_number: trackingNumber,
              shipping_vendor: shippingVendor
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send approval notification email:', emailError);
        // Don't throw here - approval was successful
      }
      
      toast.success('อนุมัติคำขอเรียบร้อย');
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการอนุมัติคำขอ');
    }
  };
  
  const handleRework = async (feedback: string) => {
    if (!request) return;
    
    try {
      // ใช้ database function สำหรับการอัพเดท rework status
      const { data: result, error } = await supabase
        .rpc('test_rework_status', {
          p_request_id: request.id,
          p_feedback: feedback
        });
      
      if (error) {
        console.error('Error requesting rework:', error);
        toast.error('ไม่สามารถส่งคำขอแก้ไขได้: ' + error.message);
        return;
      }

      // Type cast for result
      const typedResult = result as { success: boolean; error?: string; message?: string };
      
      if (!typedResult.success) {
        toast.error('ไม่สามารถส่งคำขอแก้ไขได้: ' + typedResult.error);
        return;
      }
      
      // Force re-fetch to ensure UI updates
      await fetchRequest();
      
      // Send rework notification email
      try {
        await supabase.functions.invoke('send-rework-notification', {
          body: {
            requestId: request.id,
            requestData: {
              document_name: request.document_name || request.documentName,
              requester_name: request.requesterName,
              requester_email: request.requesterEmail,
              admin_feedback: feedback
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send rework notification email:', emailError);
        // Don't throw here - rework update was successful
      }
      
      toast.success('ส่งคำขอแก้ไขเรียบร้อย');
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งคำขอแก้ไข');
    }
  };
  
  const handleReject = async (feedback: string) => {
    if (!request) return;
    
    try {
      // ใช้ database function สำหรับการอัพเดท rejected status
      const { data: result, error } = await supabase
        .rpc('test_rejected_status', {
          p_request_id: request.id,
          p_feedback: feedback
        });
      
      if (error) {
        console.error('Error rejecting request:', error);
        toast.error('ไม่สามารถปฏิเสธคำขอได้: ' + error.message);
        return;
      }

      // Type cast for result
      const typedResult = result as { success: boolean; error?: string; message?: string };
      
      if (!typedResult.success) {
        toast.error('ไม่สามารถปฏิเสธคำขอได้: ' + typedResult.error);
        return;
      }
      
      // Force re-fetch to ensure UI updates
      await fetchRequest();
      
      // Send rejection notification email
      try {
        await supabase.functions.invoke('send-rejection-notification', {
          body: {
            requestId: request.id,
            requestData: {
              document_name: request.document_name || request.documentName,
              requester_name: request.requesterName,
              requester_email: request.requesterEmail,
              admin_feedback: feedback
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send rejection notification email:', emailError);
        // Don't throw here - rejection update was successful
      }
      
      toast.success('ปฏิเสธคำขอเรียบร้อย');
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการปฏิเสธคำขอ');
    }
  };
  
  const handleConfirmDelivery = async () => {
    if (!request || !user?.id) return;
    
    try {
      // ใช้ database function สำหรับยืนยันการได้รับเอกสาร
      const { data: result, error } = await supabase
        .rpc('confirm_delivery', {
          p_request_id: request.id,
          p_receiver_id: user.id
        });
      
      if (error) {
        console.error('Error confirming delivery:', error);
        toast.error('ไม่สามารถยืนยันการได้รับเอกสารได้: ' + error.message);
        return;
      }
      
      // Type cast for result
      const typedResult = result as { success: boolean; error?: string; message?: string };
      
      if (!typedResult.success) {
        toast.error('ไม่สามารถยืนยันการได้รับเอกสารได้: ' + typedResult.error);
        return;
      }
      
      // Force re-fetch to ensure UI updates
      await fetchRequest();
      
      // Send delivery notification email
      try {
        await supabase.functions.invoke('send-delivery-notification', {
          body: {
            requestId: request.id,
            requestData: {
              document_name: request.document_name || request.documentName,
              receiver_email: request.receiver_email || request.receiverEmail,
              receiver_name: request.receiver_name || request.receiverName,
              requester_name: request.requesterName,
              requester_email: request.requesterEmail,
              tracking_number: request.tracking_number || request.trackingNumber,
              shipping_vendor: request.shipping_vendor || request.shippingVendor
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send delivery notification email:', emailError);
        // Don't throw here - delivery confirmation was successful
      }
      
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
  // Check multiple email sources for receiver - use any available email
  const userEmail = user?.email || (user as any)?.username;
  const isReceiver = userEmail === (request.receiver_email || request.receiverEmail);
  const canApprove = isAdmin && request.status === 'pending';
  const canEdit = !isAdmin && isRequester && (request.status === 'pending' || request.status === 'rework');
  
  console.log('RequestDetail - User email:', userEmail, 'Receiver email:', request.receiver_email, 'isReceiver:', isReceiver);

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
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">จำนวนเอกสาร</h3>
                    <p className="font-medium">{request.document_count || 1} เอกสาร</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">ข้อมูลผู้รับ</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">ชื่อผู้รับเอกสาร</h3>
                      <p className="font-medium">{request.receiver_name || request.receiverName || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">ประเทศ</h3>
                      <p className="font-medium">{request.country_name || request.countryName || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">ชื่อบริษัท</h3>
                      <p className="font-medium">{request.receiver_company || request.receiverCompany || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">ฝ่าย/แผนก</h3>
                      <p className="font-medium">{request.receiver_department || request.receiverDepartment || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">อีเมล</h3>
                      <p className="font-medium">{request.receiver_email || request.receiverEmail}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">เบอร์โทร</h3>
                      <p className="font-medium">{request.receiver_phone || request.receiverPhone || '-'}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">อีเมล์ของผู้ส่ง</h3>
                  <p className="font-medium">{request.requesterEmail}</p>
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
