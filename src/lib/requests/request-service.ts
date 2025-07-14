import { supabase } from '@/integrations/supabase/client';
import type { FileRequest, RequestFormData, RequestFilters, ApprovalData } from './types';
import { Session } from '@supabase/supabase-js';
import type { AuthUser } from '../auth/types';

export class RequestService {
  /**
   * สร้างคำขอใหม่
   */
  static async createRequest(
    formData: RequestFormData, 
    user: AuthUser, 
    session: Session | null
  ): Promise<FileRequest> {
    const requestData = {
      document_name: formData.documentName,
      receiver_email: formData.receiverEmail,
      file_path: formData.documentDescription,
      requester_id: user.id, // Always use user.id for consistency
      status: 'pending' as const
    };

    console.log('Request data to insert:', requestData);

    const { data, error } = await supabase
      .from('requests')
      .insert(requestData)
      .select()
      .single();

    if (error) {
      console.error('Error creating request:', error);
      throw new Error('ไม่สามารถบันทึกคำขอได้');
    }

    return data;
  }

  /**
   * อัพเดทคำขอ
   */
  static async updateRequest(
    requestId: string,
    formData: RequestFormData,
    user: AuthUser,
    session: Session | null
  ): Promise<FileRequest> {
    const requestData = {
      document_name: formData.documentName,
      receiver_email: formData.receiverEmail,
      file_path: formData.documentDescription,
      requester_id: session?.user?.id || user.id,
      status: 'pending' as const
    };

    const { data, error } = await supabase
      .from('requests')
      .update(requestData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating request:', error);
      throw new Error('ไม่สามารถบันทึกคำขอได้');
    }

    return data;
  }

  /**
   * ดึงข้อมูลคำขอทั้งหมด
   */
  static async getAllRequests(filters?: RequestFilters): Promise<FileRequest[]> {
    let query = supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.requesterEmail) {
      // Note: database field is requester_id, not requester_email
      // This filter might need to join with profiles table
    }

    if (filters?.receiverEmail) {
      query = query.eq('receiver_email', filters.receiverEmail);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching requests:', error);
      throw new Error('ไม่สามารถดึงข้อมูลคำขอได้');
    }

    return data || [];
  }

  /**
   * ดึงข้อมูลคำขอตาม ID
   */
  static async getRequestById(id: string): Promise<FileRequest | null> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching request:', error);
      return null;
    }

    return data;
  }

  /**
   * อนุมัติ/ปฏิเสธ/ขอแก้ไขคำขอ
   */
  static async processApproval(
    requestId: string,
    approvalData: ApprovalData,
    adminId: string
  ): Promise<FileRequest> {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
      approved_by: adminId
    };

    switch (approvalData.action) {
      case 'approve':
        updates.status = 'approved';
        updates.tracking_number = approvalData.trackingNumber;
        break;
      case 'reject':
        updates.status = 'rejected';
        updates.admin_feedback = approvalData.feedback;
        break;
      case 'rework':
        updates.status = 'rework';
        updates.admin_feedback = approvalData.feedback;
        break;
    }

    const { data, error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error processing approval:', error);
      throw new Error('ไม่สามารถดำเนินการได้');
    }

    return data;
  }

  /**
   * ยืนยันการจัดส่ง
   */
  static async confirmDelivery(requestId: string): Promise<FileRequest> {
    const { data, error } = await supabase
      .from('requests')
      .update({
        status: 'completed',
        is_delivered: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error confirming delivery:', error);
      throw new Error('ไม่สามารถยืนยันการจัดส่งได้');
    }

    return data;
  }

  /**
   * ดึงสถิติคำขอ
   */
  static async getRequestStats(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('requests')
      .select('status');

    if (error) {
      console.error('Error fetching request stats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        rework: 0,
        completed: 0
      };
    }

    const stats = (data || []).reduce((acc, request) => {
      acc.total++;
      const status = request.status as string;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      rework: 0,
      completed: 0
    } as Record<string, number>);

    return stats;
  }
}