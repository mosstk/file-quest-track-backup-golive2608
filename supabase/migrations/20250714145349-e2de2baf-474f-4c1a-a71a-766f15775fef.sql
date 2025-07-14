-- Drop existing delete policy that may be blocking deletion
DROP POLICY IF EXISTS "Allow delete profiles for admins" ON public.profiles;

-- Create a new delete policy that allows admin to delete non-admin users
CREATE POLICY "Admins can delete non-admin users" ON public.profiles
FOR DELETE
USING (
  -- Allow admin to delete users, but prevent deleting admin users for safety
  (is_fa_admin() AND role != 'fa_admin') 
  OR 
  -- Allow deletion of mock/test users
  (id = ANY (ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid]))
);