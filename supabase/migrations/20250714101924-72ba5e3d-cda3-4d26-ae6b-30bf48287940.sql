-- แก้ไข Anonymous policy ให้ไม่บล็อก INSERT
DROP POLICY IF EXISTS "Anonymous users cannot access requests" ON public.requests;

-- สร้าง policy ใหม่ที่เฉพาะเจาะจงสำหรับ SELECT, UPDATE, DELETE เท่านั้น
CREATE POLICY "Anonymous users cannot view requests" 
  ON public.requests FOR SELECT
  USING (false);

CREATE POLICY "Anonymous users cannot update requests" 
  ON public.requests FOR UPDATE
  USING (false);

CREATE POLICY "Anonymous users cannot delete requests" 
  ON public.requests FOR DELETE
  USING (false);