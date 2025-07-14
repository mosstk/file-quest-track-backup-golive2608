-- แก้ไข INSERT policy ให้รองรับ custom auth ของ admin
DROP POLICY IF EXISTS "Allow creating requests for all roles" ON public.requests;

CREATE POLICY "Allow creating requests for all roles"
  ON public.requests FOR INSERT
  WITH CHECK (
    -- Supabase Auth users
    (auth.uid() = requester_id AND auth.uid() IS NOT NULL)
    -- Mock users  
    OR is_mock_user_by_id(requester_id)
    -- Custom auth users (FA Admin หรือ Requester ที่ active)
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = requester_id 
      AND role IN ('fa_admin', 'requester')
      AND is_active = true
    )
  );