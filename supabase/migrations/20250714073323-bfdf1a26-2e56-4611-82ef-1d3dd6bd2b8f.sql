-- Fix RLS policies for user creation
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for own profile or admin" ON public.profiles;

-- Create updated policy that allows admin to create any user
CREATE POLICY "Admins can create any user profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow if the current user is fa_admin or if it's a mock user creation
  (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'fa_admin'
  )) 
  OR 
  -- Allow mock users to be created (for testing)
  (id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
  ))
  OR
  -- Allow if no auth.uid() (service role)
  (auth.uid() IS NULL)
);