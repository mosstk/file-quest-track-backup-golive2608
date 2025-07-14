-- ลบ policy เก่าที่ขัดแย้ง และสร้างใหม่ให้ถูกต้อง
DROP POLICY IF EXISTS "Requesters can create requests" ON public.requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.requests;

-- สร้าง policy ใหม่ที่รองรับทุก role
CREATE POLICY "Allow creating requests for all roles"
  ON public.requests FOR INSERT
  WITH CHECK (
    -- Supabase Auth users
    (auth.uid() = requester_id AND auth.uid() IS NOT NULL)
    -- Mock users
    OR is_mock_user_by_id(requester_id)
    -- FA Admin (custom auth)
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = requester_id 
      AND role = 'fa_admin'
      AND is_active = true
    )
    -- Requester role (custom auth)
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = requester_id 
      AND role IN ('requester', 'fa_admin')
      AND is_active = true
    )
  );