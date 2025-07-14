-- ลบ policy เดิมที่ซับซ้อนเกินไป
DROP POLICY IF EXISTS "Allow creating requests for all roles" ON public.requests;

-- สร้าง policy ใหม่ที่เรียบง่ายและใช้งานได้
CREATE POLICY "Users can create their own requests"
  ON public.requests 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = requester_id 
    AND auth.uid() IS NOT NULL
  );

-- เพิ่ม policy สำหรับ fa_admin ที่สามารถสร้าง request ให้คนอื่นได้
CREATE POLICY "FA Admins can create requests for anyone"
  ON public.requests 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'fa_admin'
      AND is_active = true
    )
  );

-- อัพเดท policy สำหรับ mock users
CREATE POLICY "Mock users can create requests"
  ON public.requests 
  FOR INSERT 
  WITH CHECK (
    requester_id IN (
      '11111111-1111-1111-1111-111111111111'::uuid,
      '22222222-2222-2222-2222-222222222222'::uuid,
      '33333333-3333-3333-3333-333333333333'::uuid
    )
  );