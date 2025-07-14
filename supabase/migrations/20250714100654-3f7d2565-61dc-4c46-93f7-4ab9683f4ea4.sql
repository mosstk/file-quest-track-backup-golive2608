-- อัพเดท RLS policies ให้รองรับ custom auth
-- สำหรับการสร้าง request ใหม่
DROP POLICY IF EXISTS "Users can create requests" ON public.requests;
CREATE POLICY "Users can create requests"
  ON public.requests FOR INSERT
  WITH CHECK (
    auth.uid() = requester_id 
    OR is_mock_user_by_id(requester_id)
    OR is_fa_admin()
  );

-- อัพเดท policy สำหรับการอัพเดท request
DROP POLICY IF EXISTS "Users can update own pending/rework requests" ON public.requests;
CREATE POLICY "Users can update own pending/rework requests"
  ON public.requests FOR UPDATE
  USING (
    (requester_id = auth.uid()) 
    OR is_fa_admin() 
    OR is_mock_user_by_id(requester_id)
    OR (requester_id IN (
      SELECT id FROM profiles WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    ))
  );