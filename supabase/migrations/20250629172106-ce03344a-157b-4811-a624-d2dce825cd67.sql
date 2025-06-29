
-- Fix RLS policies for mock users to be able to create requests
-- First, let's make sure mock users can create profiles
CREATE OR REPLACE FUNCTION public.is_mock_user_by_id(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid
  );
$$;

-- Update the profiles policies to allow mock users
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    OR public.is_fa_admin()
    OR public.is_mock_user_by_id(id)
  );

-- Update the requests policies to allow mock users to create requests
DROP POLICY IF EXISTS "Users can create requests" ON public.requests;
CREATE POLICY "Users can create requests"
  ON public.requests 
  FOR INSERT
  WITH CHECK (
    auth.uid() = requester_id 
    OR public.is_fa_admin()
    OR public.is_mock_user_by_id(requester_id)
  );

-- Also update the view and update policies for requests
DROP POLICY IF EXISTS "Users can view requests" ON public.requests;
CREATE POLICY "Users can view requests"
  ON public.requests 
  FOR SELECT
  USING (
    requester_id = auth.uid()
    OR public.is_fa_admin()
    OR public.is_mock_user_by_id(requester_id)
    OR (
      status = 'approved' 
      AND receiver_email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update requests" ON public.requests;
CREATE POLICY "Users can update requests"
  ON public.requests 
  FOR UPDATE
  USING (
    (requester_id = auth.uid() AND status IN ('pending', 'rework'))
    OR public.is_fa_admin()
    OR public.is_mock_user_by_id(requester_id)
  );
