export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'rework' | 'completed';

export interface FileRequest {
  id: string;
  created_at: string;
  updated_at: string;
  requester_id: string;
  document_name: string;
  receiver_email: string;
  file_path?: string;
  status: RequestStatus;
  tracking_number?: string;
  admin_feedback?: string;
  is_delivered?: boolean;
  approved_by?: string;
  
  // Legacy fields for backward compatibility
  documentName?: string;
  receiverEmail?: string;
  requesterEmail?: string;
}

export interface RequestFormData {
  documentName: string;
  documentDescription: string;
  receiverEmail: string;
}

export interface RequestFilters {
  status?: RequestStatus;
  requesterEmail?: string;
  receiverEmail?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  rework: number;
  completed: number;
}

export interface ApprovalData {
  action: 'approve' | 'reject' | 'rework';
  feedback?: string;
  trackingNumber?: string;
}