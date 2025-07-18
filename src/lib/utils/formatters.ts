
import { FileRequest, User } from '@/types';

/**
 * Normalizes a FileRequest object to include both snake_case and camelCase properties
 */
export function normalizeFileRequest(request: Partial<FileRequest>): FileRequest {
  return {
    id: request.id || '',
    requester_id: request.requester_id || '',
    document_name: request.document_name || request.documentName || '',
    documentName: request.document_name || request.documentName || '',
    document_count: request.document_count || (request as any).document_count || undefined,
    receiver_email: request.receiver_email || request.receiverEmail || '',
    receiverEmail: request.receiver_email || request.receiverEmail || '',
    receiver_name: request.receiver_name || request.receiverName || (request as any).receiver_name || undefined,
    receiverName: request.receiver_name || request.receiverName || (request as any).receiver_name || undefined,
    receiver_company: request.receiver_company || request.receiverCompany || (request as any).receiver_company || undefined,
    receiverCompany: request.receiver_company || request.receiverCompany || (request as any).receiver_company || undefined,
    receiver_department: request.receiver_department || request.receiverDepartment || (request as any).receiver_department || undefined,
    receiverDepartment: request.receiver_department || request.receiverDepartment || (request as any).receiver_department || undefined,
    receiver_phone: request.receiver_phone || request.receiverPhone || (request as any).receiver_phone || undefined,
    receiverPhone: request.receiver_phone || request.receiverPhone || (request as any).receiver_phone || undefined,
    country_name: request.country_name || request.countryName || (request as any).country_name || undefined,
    countryName: request.country_name || request.countryName || (request as any).country_name || undefined,
    file_path: request.file_path || request.fileAttachment || '',
    fileAttachment: request.file_path || request.fileAttachment || '',
    status: request.status || 'pending',
    created_at: request.created_at || request.createdAt || new Date().toISOString(),
    createdAt: request.created_at || request.createdAt || new Date().toISOString(),
    updated_at: request.updated_at || request.updatedAt || new Date().toISOString(),
    updatedAt: request.updated_at || request.updatedAt || new Date().toISOString(),
    tracking_number: request.tracking_number || request.trackingNumber || undefined,
    trackingNumber: request.tracking_number || request.trackingNumber || undefined,
    admin_feedback: request.admin_feedback || request.adminFeedback || undefined,
    adminFeedback: request.admin_feedback || request.adminFeedback || undefined,
    is_delivered: request.is_delivered || request.isDelivered || false,
    isDelivered: request.is_delivered || request.isDelivered || false,
    approved_by: request.approved_by || undefined,
    shipping_vendor: request.shipping_vendor || request.shippingVendor || (request as any).shipping_vendor || undefined,
    shippingVendor: request.shipping_vendor || request.shippingVendor || (request as any).shipping_vendor || undefined,
    requesterName: request.requesterName || (request as any).requester_name || '',
    requesterEmail: request.requesterEmail || (request as any).requester_email || '',
    requesterEmployeeId: request.requesterEmployeeId || (request as any).requester_employee_id || '',
    requesterCompany: request.requesterCompany || (request as any).requester_company || '',
    requesterDepartment: request.requesterDepartment || (request as any).requester_department || '',
    requesterDivision: request.requesterDivision || (request as any).requester_division || '',
  } as FileRequest;
}

/**
 * Normalizes a User object to include both snake_case and camelCase properties
 */
export function normalizeUser(userData: Partial<User>): User {
  return {
    id: userData.id || '',
    email: userData.email || '',
    role: userData.role || 'requester',
    employee_id: userData.employee_id || userData.employeeId || undefined,
    employeeId: userData.employee_id || userData.employeeId || undefined,
    company: userData.company || undefined,
    department: userData.department || undefined,
    division: userData.division || undefined,
    full_name: userData.full_name || userData.name || undefined,
    name: userData.full_name || userData.name || undefined,
    avatar_url: userData.avatar_url || userData.avatar || undefined,
    avatar: userData.avatar_url || userData.avatar || undefined,
  } as User;
}

/**
 * Type for database insert/update operations
 */
type DatabaseRequestData = {
  document_name: string;
  receiver_email: string;
  requester_id: string;
  file_path?: string | null;
  status?: 'pending' | 'approved' | 'rejected' | 'rework' | 'completed';
  tracking_number?: string | null;
  admin_feedback?: string | null;
  is_delivered?: boolean | null;
  approved_by?: string | null;
};

/**
 * Prepares a FileRequest object for submission to the API (converts camelCase to snake_case)
 */
export function prepareFileRequestForApi(request: Partial<FileRequest>): DatabaseRequestData {
  // Ensure required fields are present
  const document_name = request.document_name || request.documentName;
  const receiver_email = request.receiver_email || request.receiverEmail;
  const requester_id = request.requester_id;
  
  if (!document_name || !receiver_email || !requester_id) {
    throw new Error("Required fields missing: document_name, receiver_email, and requester_id are required");
  }
  
  // Return only the properties that match the database schema
  return {
    document_name,
    receiver_email,
    requester_id,
    file_path: request.file_path || request.fileAttachment || null,
    status: request.status || 'pending',
    tracking_number: request.tracking_number || request.trackingNumber || null,
    admin_feedback: request.admin_feedback || request.adminFeedback || null,
    is_delivered: request.is_delivered || request.isDelivered || null,
    approved_by: request.approved_by || null,
  };
}
