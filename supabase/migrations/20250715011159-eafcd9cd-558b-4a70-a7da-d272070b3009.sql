-- ตรวจสอบและปรับปรุง RLS policies สำหรับตาราง requests
-- เพื่อให้แน่ใจว่า requester เห็นเฉพาะคำขอของตัวเอง และ admin เห็นทั้งหมด

-- ลบ policies เก่าที่อาจทำให้เกิดปัญหา
DROP POLICY IF EXISTS "Users can view their own requests" ON public.requests;
DROP POLICY IF EXISTS "Receivers can view approved requests sent to them" ON public.requests;
DROP POLICY IF EXISTS "Anonymous users cannot view requests" ON public.requests;

-- สร้าง policy ใหม่ที่ชัดเจนขึ้น
-- 1. Requesters สามารถดูเฉพาะคำขอของตัวเอง
CREATE POLICY "Requesters can view only their own requests"
ON public.requests 
FOR SELECT 
USING (
  requester_id = auth.uid()
);

-- 2. Receivers สามารถดูคำขอที่อนุมัติแล้วและส่งมาให้พวกเขา
CREATE POLICY "Receivers can view approved requests sent to them"
ON public.requests 
FOR SELECT 
USING (
  status = 'approved'::request_status 
  AND receiver_email = (
    SELECT email FROM public.profiles WHERE id = auth.uid()
  )
);

-- 3. FA Admins สามารถดูทั้งหมด (policy นี้มีอยู่แล้วแต่ตรวจสอบอีกครั้ง)
DROP POLICY IF EXISTS "FA Admins can view all requests" ON public.requests;
CREATE POLICY "FA Admins can view all requests"
ON public.requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'fa_admin' 
    AND is_active = true
  )
);