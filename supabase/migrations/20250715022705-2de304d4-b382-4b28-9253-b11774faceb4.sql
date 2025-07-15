-- Fix the RLS policy that's causing permission denied for table users
DROP POLICY IF EXISTS "Users can update own pending/rework requests" ON public.requests;

CREATE POLICY "Users can update own pending/rework requests" 
ON public.requests 
FOR UPDATE 
USING (
  (requester_id = auth.uid()) 
  OR is_fa_admin() 
  OR is_mock_user_by_id(requester_id)
);