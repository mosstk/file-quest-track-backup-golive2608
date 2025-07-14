-- Insert missing test users
INSERT INTO public.profiles (
  id, 
  username, 
  password, 
  full_name, 
  role, 
  employee_id, 
  company, 
  department, 
  division, 
  is_active
) VALUES 
-- Admin user (fa_admin role)
(
  '11111111-1111-1111-1111-111111111111',
  'admin',
  'admin',
  'TOA Admin',
  'fa_admin',
  'EMP-ADMIN-001',
  'TOA Group',
  'Information Technology',
  'Digital Solutions',
  true
),
-- Receiver user
(
  '33333333-3333-3333-3333-333333333333',
  'receiver',
  'receiver',
  'Test Receiver',
  'receiver',
  'EMP-REC-001',
  'TOA Group',
  'Operations',
  'File Management',
  true
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  employee_id = EXCLUDED.employee_id,
  company = EXCLUDED.company,
  department = EXCLUDED.department,
  division = EXCLUDED.division,
  is_active = EXCLUDED.is_active;