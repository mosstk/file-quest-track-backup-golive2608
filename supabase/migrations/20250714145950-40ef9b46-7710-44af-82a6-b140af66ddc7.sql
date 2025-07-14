-- ตรวจสอบ policies ปัจจุบัน
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'DELETE';

-- ลบ policy เก่าและสร้างใหม่
DROP POLICY IF EXISTS "Admins can delete non-admin users" ON public.profiles;
DROP POLICY IF EXISTS "Allow delete profiles for admins" ON public.profiles;

-- สร้าง policy ใหม่ที่อนุญาตให้ admin ลบ user ได้
CREATE POLICY "Allow admin to delete users" ON public.profiles
FOR DELETE
USING (
  -- Admin สามารถลบ user ได้ยกเว้น admin อื่นๆ
  (is_fa_admin() AND role != 'fa_admin') 
  OR 
  -- อนุญาตให้ลบ mock users
  is_mock_user_by_id(id)
  OR
  -- Admin สามารถลบ user ที่ไม่ active ได้
  (is_fa_admin() AND is_active = false)
);