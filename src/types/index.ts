
export type UserRole = 'fa_admin' | 'requester' | 'receiver';

export interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  company: string;
  department: string;
  division: string;
  role: UserRole;
  avatar?: string;
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
