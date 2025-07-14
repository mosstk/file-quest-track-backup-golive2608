-- ตรวจสอบ is_fa_admin function
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'is_fa_admin';

-- ตรวจสอบ policies ทั้งหมดของ profiles table
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- ลบ policy ทั้งหมดและสร้างใหม่แบบง่ายๆ
DROP POLICY IF EXISTS "fa_admin_can_delete" ON public.profiles;

-- สร้าง policy ที่อนุญาตให้ admin ลบได้โดยตรง
CREATE POLICY "Allow admin delete all" ON public.profiles
FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'fa_admin'
);