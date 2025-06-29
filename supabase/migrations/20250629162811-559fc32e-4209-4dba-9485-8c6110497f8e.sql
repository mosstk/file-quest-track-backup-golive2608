
-- Add RLS policy to allow admins to insert profiles
CREATE POLICY "FA Admins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'fa_admin'
    )
  );

-- Add RLS policy to allow admins to update all profiles
CREATE POLICY "FA Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'fa_admin'
    )
  );

-- Add RLS policy to allow admins to delete profiles
CREATE POLICY "FA Admins can delete profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'fa_admin'
    )
  );
