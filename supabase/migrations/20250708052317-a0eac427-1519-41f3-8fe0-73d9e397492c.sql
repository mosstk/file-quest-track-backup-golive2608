-- แก้ไข RLS policy ที่ยังคงเข้าถึงตาราง auth.users
DROP POLICY IF EXISTS "Receivers can view approved requests sent to them" ON public.requests;

-- สร้าง policy ใหม่ที่ไม่เข้าถึงตาราง auth.users โดยตรง
-- ให้ receivers สามารถดูคำขออนุมัติทั้งหมดได้
CREATE POLICY "Receivers can view approved requests" 
ON public.requests 
FOR SELECT 
USING (
  (requester_id = auth.uid()) OR 
  is_fa_admin() OR 
  is_mock_user_by_id(requester_id) OR
  (status = 'approved' AND auth.uid() IS NOT NULL)
);