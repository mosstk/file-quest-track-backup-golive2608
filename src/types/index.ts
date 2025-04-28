
export type UserRole = 'fa_admin' | 'requester' | 'receiver';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  employee_id?: string;
  employeeId?: string;
  company?: string;
  department?: string;
  division?: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  avatar?: string;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'rework' | 'completed';

export interface FileRequest {
  id: string;
  requester_id: string;
  document_name: string;
  documentName?: string;
  receiver_email: string;
  receiverEmail?: string;
  file_path?: string;
  fileAttachment?: string;
  status: RequestStatus;
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
  tracking_number?: string;
  trackingNumber?: string;
  admin_feedback?: string;
  adminFeedback?: string;
  is_delivered?: boolean;
  isDelivered?: boolean;
  approved_by?: string;
  
  // Additional props for UI display
  requesterName?: string;
  requesterEmail?: string;
  requesterEmployeeId?: string;
  requesterCompany?: string;
  requesterDepartment?: string;
  requesterDivision?: string;
}
