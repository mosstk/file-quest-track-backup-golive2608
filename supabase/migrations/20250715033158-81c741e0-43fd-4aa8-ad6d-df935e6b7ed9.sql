-- แก้ไข RLS policy ให้ receivers ดู requests ทั้งหมดที่ส่งมาให้ตนเอง ไม่จำกัดเฉพาะ approved
DROP POLICY IF EXISTS "Receivers can view approved requests sent to them" ON public.requests;

-- สร้าง policy ใหม่ที่ให้ receivers ดู requests ทั้งหมดที่ส่งมาให้ตนเอง
CREATE POLICY "Receivers can view all requests sent to them" 
ON public.requests 
FOR SELECT 
USING (
  receiver_email = (
    SELECT COALESCE(email, username) 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);