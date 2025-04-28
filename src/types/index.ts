
export type UserRole = 'fa_admin' | 'requester' | 'receiver';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  employee_id?: string;
  company?: string;
  department?: string;
  division?: string;
  full_name?: string;
  avatar_url?: string;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'rework' | 'completed';

export interface FileRequest {
  id: string;
  requester_id: string;
  document_name: string;
  receiver_email: string;
  file_path?: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  tracking_number?: string;
  admin_feedback?: string;
  is_delivered?: boolean;
  approved_by?: string;
}
