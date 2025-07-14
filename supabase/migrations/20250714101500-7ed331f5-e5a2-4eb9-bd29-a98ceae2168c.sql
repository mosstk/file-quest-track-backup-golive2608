-- แก้ไข RLS policy ให้ admin สามารถสร้างคำขอได้
DROP POLICY IF EXISTS "Users can create requests" ON public.requests;
CREATE POLICY "Users can create requests"
  ON public.requests FOR INSERT
  WITH CHECK (
    -- อนุญาตหาก auth.uid() ตรงกับ requester_id (Supabase Auth)
    auth.uid() = requester_id 
    -- หรือ requester_id เป็น mock user
    OR is_mock_user_by_id(requester_id)
    -- หรือ requester_id เป็น admin profile
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = requester_id 
      AND role = 'fa_admin'
    )
  );