-- ลบ policy เดิมที่ซับซ้อน
DROP POLICY IF EXISTS "Users can view their own requests" ON public.requests;
DROP POLICY IF EXISTS "Receivers can view approved requests" ON public.requests;

-- สร้าง policy ใหม่ที่เรียบง่ายสำหรับ SELECT
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

CREATE POLICY "Users can view their own requests"
  ON public.requests 
  FOR SELECT 
  USING (
    requester_id = auth.uid()
    OR 
    requester_id IN (
      '11111111-1111-1111-1111-111111111111'::uuid,
      '22222222-2222-2222-2222-222222222222'::uuid,
      '33333333-3333-3333-3333-333333333333'::uuid
    )
  );

CREATE POLICY "Receivers can view approved requests sent to them"
  ON public.requests 
  FOR SELECT 
  USING (
    status = 'approved' 
    AND receiver_email = (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    )
  );