
-- เพิ่ม function สำหรับตรวจสอบว่าเป็น mock user หรือไม่ (แก้ไขแล้ว)
CREATE OR REPLACE FUNCTION public.is_mock_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND full_name LIKE 'Test %'
  );
$$;

-- อัปเดต RLS policy สำหรับ profiles เพื่อให้รองรับ mock users
DROP POLICY IF EXISTS "Allow insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow delete profiles" ON public.profiles;

-- Policy สำหรับ SELECT
CREATE POLICY "Users can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id 
    OR public.is_fa_admin() 
    OR public.is_mock_user(id)
  );

-- Policy สำหรับ INSERT
CREATE POLICY "Users can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    OR public.is_fa_admin()
    OR public.can_insert_profile(id)
  );

-- Policy สำหรับ UPDATE
CREATE POLICY "Users can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    auth.uid() = id 
    OR public.is_fa_admin()
    OR public.is_mock_user(id)
  );

-- Policy สำหรับ DELETE (เฉพาะ admin และ mock users)
CREATE POLICY "Admins can delete profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (
    public.is_fa_admin() 
    OR public.is_mock_user(id)
  );

-- อัปเดต RLS policies สำหรับ requests table
DROP POLICY IF EXISTS "Requesters can create requests" ON public.requests;
DROP POLICY IF EXISTS "FA Admins can view all requests" ON public.requests;
DROP POLICY IF EXISTS "Requesters can view their own requests" ON public.requests;
DROP POLICY IF EXISTS "Receivers can view approved requests sent to them" ON public.requests;
DROP POLICY IF EXISTS "FA Admins can update any request" ON public.requests;
DROP POLICY IF EXISTS "Requesters can update their own pending or rework requests" ON public.requests;

-- Policy สำหรับการสร้าง requests (รองรับ mock users)
CREATE POLICY "Users can create requests"
  ON public.requests 
  FOR INSERT
  WITH CHECK (
    auth.uid() = requester_id 
    OR public.is_mock_user(requester_id)
    OR public.is_fa_admin()
  );

-- Policy สำหรับการดู requests
CREATE POLICY "Users can view requests"
  ON public.requests 
  FOR SELECT
  USING (
    requester_id = auth.uid()
    OR public.is_fa_admin()
    OR public.is_mock_user(requester_id)
    OR (
      status = 'approved' 
      AND receiver_email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Policy สำหรับการอัปเดต requests
CREATE POLICY "Users can update requests"
  ON public.requests 
  FOR UPDATE
  USING (
    (requester_id = auth.uid() AND status IN ('pending', 'rework'))
    OR public.is_fa_admin()
    OR public.is_mock_user(requester_id)
  );
