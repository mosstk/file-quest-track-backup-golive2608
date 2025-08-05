-- แก้ไข RLS policy สำหรับ receiver ให้รองรับทั้ง Supabase auth และ custom auth
DROP POLICY IF EXISTS "Receivers can view all requests sent to them" ON public.requests;

CREATE POLICY "Receivers can view all requests sent to them" 
ON public.requests 
FOR SELECT 
USING (
  -- ถ้าใช้ Supabase auth
  (auth.uid() IS NOT NULL AND receiver_email = (
    SELECT COALESCE(profiles.email, profiles.username) 
    FROM profiles 
    WHERE profiles.id = auth.uid()
  ))
  OR
  -- ถ้าใช้ custom auth หรือ anonymous access - allow all for now
  (auth.uid() IS NULL)
);