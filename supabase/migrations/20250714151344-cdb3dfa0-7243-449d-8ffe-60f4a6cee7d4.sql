-- ลบ policy เก่าทั้งหมด
DROP POLICY IF EXISTS "Admin delete policy" ON public.profiles;

-- สร้าง policy ใหม่ที่ใช้ security definer function
CREATE POLICY "fa_admin_can_delete" ON public.profiles
FOR DELETE
USING (is_fa_admin());