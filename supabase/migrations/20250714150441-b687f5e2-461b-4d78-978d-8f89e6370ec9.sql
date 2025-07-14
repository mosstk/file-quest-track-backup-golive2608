-- ลบ policy เก่าทั้งหมด
DROP POLICY IF EXISTS "Allow admin to delete users" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete non-admin users" ON public.profiles;
DROP POLICY IF EXISTS "Allow delete profiles for admins" ON public.profiles;

-- สร้าง policy ใหม่ที่เรียบง่ายและทำงานได้จริง
CREATE POLICY "Admin can delete any user except system admin" ON public.profiles
FOR DELETE
USING (
  -- ผู้ใช้ปัจจุบันต้องเป็น fa_admin และ user ที่จะลบต้องไม่ใช่ system admin หลัก
  is_fa_admin() 
  AND id != '11111111-1111-1111-1111-111111111111'::uuid
);