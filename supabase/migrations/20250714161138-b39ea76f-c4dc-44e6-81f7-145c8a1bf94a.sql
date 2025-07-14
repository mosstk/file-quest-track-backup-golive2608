-- สร้าง function เพื่อ override auth.uid() สำหรับ mock users
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  -- ถ้าเป็น authenticated user ให้ใช้ auth.uid()
  -- ถ้าไม่ใช่ ให้ return mock admin id สำหรับการทดสอบ
  SELECT COALESCE(
    auth.uid(),
    '11111111-1111-1111-1111-111111111111'::uuid
  );
$$;

-- อัพเดท RLS policies ให้ใช้ function ใหม่
DROP POLICY IF EXISTS "Users can create their own requests" ON public.requests;
DROP POLICY IF EXISTS "FA Admins can create requests for anyone" ON public.requests;
DROP POLICY IF EXISTS "Mock users can create requests" ON public.requests;

-- สร้าง policy ใหม่ที่ใช้ function
CREATE POLICY "Authenticated users can create requests"
  ON public.requests 
  FOR INSERT 
  WITH CHECK (
    requester_id = public.get_current_user_id()
    OR 
    requester_id IN (
      '11111111-1111-1111-1111-111111111111'::uuid,
      '22222222-2222-2222-2222-222222222222'::uuid,
      '33333333-3333-3333-3333-333333333333'::uuid
    )
  );