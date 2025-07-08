-- ปรับปรุง RLS policies สำหรับตาราง requests ให้หลีกเลี่ยงการเข้าถึงตาราง auth.users

-- ลบ policies เก่าที่มีปัญหา
DROP POLICY IF EXISTS "Users can view requests" ON public.requests;
DROP POLICY IF EXISTS "Users can view relevant requests" ON public.requests;

-- สร้าง policies ใหม่ที่ไม่ต้องเข้าถึงตาราง auth.users
CREATE POLICY "Users can view their own requests" 
ON public.requests 
FOR SELECT 
USING (
  (requester_id = auth.uid()) OR 
  is_fa_admin() OR 
  is_mock_user_by_id(requester_id)
);

CREATE POLICY "Receivers can view approved requests sent to them" 
ON public.requests 
FOR SELECT 
USING (
  (status = 'approved' AND receiver_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )) OR
  (requester_id = auth.uid()) OR 
  is_fa_admin() OR 
  is_mock_user_by_id(requester_id)
);

-- เพิ่ม policy สำหรับผู้ที่ไม่ได้ login (anonymous access)
CREATE POLICY "Anonymous users cannot access requests" 
ON public.requests 
FOR ALL 
USING (false);

-- อัปเดต policy สำหรับการแก้ไข requests
DROP POLICY IF EXISTS "Users can update requests" ON public.requests;
DROP POLICY IF EXISTS "Users can update own requests" ON public.requests;

CREATE POLICY "Users can update own pending/rework requests" 
ON public.requests 
FOR UPDATE 
USING (
  ((requester_id = auth.uid()) AND (status = ANY (ARRAY['pending'::request_status, 'rework'::request_status]))) OR 
  is_fa_admin() OR 
  is_mock_user_by_id(requester_id)
);