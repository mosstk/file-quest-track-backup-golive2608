
-- Drop existing policies
DROP POLICY IF EXISTS "FA Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "FA Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "FA Admins can delete profiles" ON public.profiles;

-- Create a security definer function to check if current user is FA Admin
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

-- Allow users to insert their own profile OR FA Admins to insert any profile
CREATE POLICY "Users can insert own profile or admins can insert any" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id OR public.is_fa_admin()
  );

-- Allow users to update their own profile OR FA Admins to update any profile
CREATE POLICY "Users can update own profile or admins can update any" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    auth.uid() = id OR public.is_fa_admin()
  );

-- Allow FA Admins to delete any profile (but not their own to prevent lockout)
CREATE POLICY "FA Admins can delete other profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (
    public.is_fa_admin() AND auth.uid() != id
  );

-- Allow everyone to view profiles (needed for admin functions)
CREATE POLICY "Everyone can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);
