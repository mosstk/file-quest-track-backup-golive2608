
-- First, let's check and fix the RLS policies
-- Drop the existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can insert own profile or admins can insert any" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update any" ON public.profiles;
DROP POLICY IF EXISTS "FA Admins can delete other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;

-- Recreate the security definer function to be more robust
CREATE OR REPLACE FUNCTION public.is_fa_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'fa_admin'
  );
$$;

-- Create a function to check if user can insert (either their own profile or admin)
CREATE OR REPLACE FUNCTION public.can_insert_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (auth.uid() = profile_user_id) OR public.is_fa_admin();
$$;

-- Allow users to view all profiles (needed for admin functions)
CREATE POLICY "Allow view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Allow users to insert their own profile OR admins to insert any profile
CREATE POLICY "Allow insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (public.can_insert_profile(id));

-- Allow users to update their own profile OR admins to update any profile
CREATE POLICY "Allow update profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id OR public.is_fa_admin());

-- Allow admins to delete profiles (but not their own)
CREATE POLICY "Allow delete profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (public.is_fa_admin() AND auth.uid() != id);
