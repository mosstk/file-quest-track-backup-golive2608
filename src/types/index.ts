
/** Sync types with Supabase public.profiles table */
export type UserRole = 'fa_admin' | 'requester' | 'receiver';

export interface User {
  id: string;
  full_name: string | null;
  email?: string; // Not present in profiles, but fetched separately for convenience
  username?: string | null;
  avatar_url?: string | null;
  employee_id?: string | null;
  company?: string | null;
  department?: string | null;
  division?: string | null;
  role: UserRole;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'rework' | 'completed';

export interface FileRequest {
  id: string;
  requesterName: string;
  requesterEmployeeId: string;
  requesterCompany: string;
  requesterDepartment: string;
  requesterDivision: string;
  documentName: string;
  requesterEmail: string;
  receiverEmail: string;
  fileAttachment?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  adminFeedback?: string;
  isDelivered?: boolean;
}
