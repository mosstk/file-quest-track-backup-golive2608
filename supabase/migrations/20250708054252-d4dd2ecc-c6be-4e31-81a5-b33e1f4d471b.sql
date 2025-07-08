-- ลบ policies ที่ซ้ำซ้อนและสร้างใหม่อย่างถูกต้อง
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- อัพเดทข้อมูล admin user (ถ้ามีอยู่)
INSERT INTO public.profiles (id, full_name, username, employee_id, role, company, department, division, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'System Admin',
  'admin',
  'SYS-ADMIN-001',
  'fa_admin',
  'System',
  'IT',
  'Administration',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = 'fa_admin',
  is_active = true;

-- เพิ่ม mock admin user สำหรับการทดสอบ
INSERT INTO public.profiles (id, full_name, username, employee_id, role, company, department, division, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Mock Admin User',
  'mockadmin',
  'MOCK-ADMIN-001',
  'fa_admin',
  'Mock Company',
  'IT',
  'Administration',
  true
) ON CONFLICT (id) DO NOTHING;