
-- Insert example user paths data
INSERT INTO public.user_paths (user_id, path_name, path_value) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Documents', '/home/user/Documents'),
  ('00000000-0000-0000-0000-000000000001', 'Downloads', '/home/user/Downloads'),
  ('00000000-0000-0000-0000-000000000001', 'Projects', '/home/user/Projects'),
  ('00000000-0000-0000-0000-000000000002', 'Shared Drive', '\\\\server\\shared'),
  ('00000000-0000-0000-0000-000000000002', 'Reports', 'C:\\Reports'),
  ('00000000-0000-0000-0000-000000000003', 'Archive', '/mnt/archive'),
  ('00000000-0000-0000-0000-000000000003', 'Backup', '/backup/daily');

-- Insert example requests data
INSERT INTO public.requests (requester_id, document_name, receiver_email, status, file_path, tracking_number, admin_feedback) VALUES
  ('00000000-0000-0000-0000-000000000001', 'รายงานประจำเดือน มกราคม 2024', 'manager@company.com', 'approved', '/documents/monthly_report_jan2024.pdf', 'TR-2024-001', 'อนุมัติแล้ว กรุณาส่งไฟล์ภายในวันที่ 15'),
  ('00000000-0000-0000-0000-000000000001', 'แผนการดำเนินงาน Q1', 'director@company.com', 'pending', NULL, 'TR-2024-002', NULL),
  ('00000000-0000-0000-0000-000000000002', 'สรุปผลการขาย ธันวาคม', 'sales@company.com', 'rework', NULL, 'TR-2024-003', 'กรุณาแก้ไขรูปแบบตามเทมเพลตที่กำหนด'),
  ('00000000-0000-0000-0000-000000000002', 'รายงานค่าใช้จ่าย', 'finance@company.com', 'rejected', NULL, 'TR-2024-004', 'เอกสารไม่ครบถ้วน ขาดลายเซ็นผู้อนุมัติ'),
  ('00000000-0000-0000-0000-000000000003', 'แผนงบประมาณ 2024', 'ceo@company.com', 'completed', '/documents/budget_plan_2024.xlsx', 'TR-2024-005', 'ดำเนินการเสร็จสิ้น');

-- Insert example profiles data (for display purposes)
INSERT INTO public.profiles (id, full_name, role, employee_id, company, department, division) VALUES
  ('00000000-0000-0000-0000-000000000001', 'สมชาย ใจดี', 'requester', 'EMP001', 'TOA Group', 'การเงิน', 'บัญชี'),
  ('00000000-0000-0000-0000-000000000002', 'สมหญิง รักงาน', 'requester', 'EMP002', 'TOA Group', 'ขาย', 'ขายในประเทศ'),
  ('00000000-0000-0000-0000-000000000003', 'วิชาญ เก่งมาก', 'fa_admin', 'ADM001', 'TOA Group', 'IT', 'ระบบสารสนเทศ')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  employee_id = EXCLUDED.employee_id,
  company = EXCLUDED.company,
  department = EXCLUDED.department,
  division = EXCLUDED.division;
