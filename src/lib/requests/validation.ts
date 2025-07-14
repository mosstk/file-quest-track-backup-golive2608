import type { RequestFormData } from './types';

export class RequestValidation {
  /**
   * ตรวจสอบความถูกต้องของข้อมูลฟอร์ม
   */
  static validateRequestForm(formData: RequestFormData): { isValid: boolean; error?: string } {
    if (!formData.documentName.trim()) {
      return { isValid: false, error: 'กรุณากรอกชื่อเอกสาร' };
    }

    if (!formData.receiverEmail.trim()) {
      return { isValid: false, error: 'กรุณากรอกอีเมลผู้รับ' };
    }

    if (!this.isValidEmail(formData.receiverEmail)) {
      return { isValid: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' };
    }

    return { isValid: true };
  }

  /**
   * ตรวจสอบรูปแบบอีเมล
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * ตรวจสอบ tracking number
   */
  static isValidTrackingNumber(trackingNumber: string): boolean {
    return trackingNumber.trim().length >= 3;
  }

  /**
   * ตรวจสอบข้อมูลการอนุมัติ
   */
  static validateApprovalData(action: string, feedback?: string, trackingNumber?: string): { isValid: boolean; error?: string } {
    if (!action || !['approve', 'reject', 'rework'].includes(action)) {
      return { isValid: false, error: 'กรุณาเลือกการดำเนินการ' };
    }

    if (action === 'approve' && (!trackingNumber || !this.isValidTrackingNumber(trackingNumber))) {
      return { isValid: false, error: 'กรุณากรอกหมายเลขติดตาม' };
    }

    if ((action === 'reject' || action === 'rework') && (!feedback || feedback.trim().length < 5)) {
      return { isValid: false, error: 'กรุณากรอกเหตุผล (อย่างน้อย 5 ตัวอักษร)' };
    }

    return { isValid: true };
  }
}