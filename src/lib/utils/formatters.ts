
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
    receiver_email: request.receiver_email || request.receiverEmail || '',
    receiverEmail: request.receiver_email || request.receiverEmail || '',
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
    requesterName: request.requesterName || '',
    requesterEmail: request.requesterEmail || '',
    requesterEmployeeId: request.requesterEmployeeId || '',
    requesterCompany: request.requesterCompany || '',
    requesterDepartment: request.requesterDepartment || '',
    requesterDivision: request.requesterDivision || '',
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
 * Prepares a FileRequest object for submission to the API (converts camelCase to snake_case)
 */
export function prepareFileRequestForApi(request: Partial<FileRequest>): Record<string, any> {
  // Ensure required fields are present
  const document_name = request.document_name || request.documentName;
  const receiver_email = request.receiver_email || request.receiverEmail;
  
  if (!document_name || !receiver_email) {
    throw new Error("Required fields missing: document_name and receiver_email are required");
  }
  
  // Return only the properties that match the database schema
  return {
    document_name,
    receiver_email,
    requester_id: request.requester_id,
    file_path: request.file_path || request.fileAttachment,
    status: request.status,
    tracking_number: request.tracking_number || request.trackingNumber,
    admin_feedback: request.admin_feedback || request.adminFeedback,
    is_delivered: request.is_delivered || request.isDelivered,
    approved_by: request.approved_by,
  };
}
