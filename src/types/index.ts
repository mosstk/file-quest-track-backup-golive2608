
/** Sync types with Supabase public.profiles table */
export type UserRole = 'fa_admin' | 'requester' | 'receiver';

export interface User {
  id: string;
  full_name: string | null;
  email?: string; 
  username?: string | null;
  avatar_url?: string | null;
  employee_id?: string | null;
  company?: string | null;
  department?: string | null;
  division?: string | null;
  role: UserRole;
  
  // Aliased properties for backward compatibility with existing code
  get name(): string | null {
    return this.full_name;
  }
  
  get employeeId(): string | null {
    return this.employee_id;
  }
  
  get avatar(): string | null {
    return this.avatar_url;
  }
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
