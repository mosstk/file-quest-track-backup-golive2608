-- ตรวจสอบ policy ปัจจุบัน
SELECT policyname, cmd, permissive, roles, qual 
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'DELETE';

-- เพิ่ม policy ที่อนุญาตให้ admin ลบได้อย่างง่ายดาย
DROP POLICY IF EXISTS "Admin can delete any user except system admin" ON public.profiles;

CREATE POLICY "Admin delete policy" ON public.profiles
FOR DELETE
USING (
  -- เช็คว่าผู้ใช้ปัจจุบันเป็น admin และไม่ใช่การลบตัวเอง
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'fa_admin'
  AND id != auth.uid()
);