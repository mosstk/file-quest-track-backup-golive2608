
-- Create real users in auth.users table and their profiles
-- Insert real users into auth.users (using SQL to bypass normal auth flow for testing)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111'::uuid,
    'authenticated',
    'authenticated',
    'admin@toagroup.com',
    '$2a$10$mock.encrypted.password.hash.for.testing.purposes.only',
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"TOA Admin","role":"fa_admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222'::uuid,
    'authenticated',
    'authenticated',
    'requester@toagroup.com',
    '$2a$10$mock.encrypted.password.hash.for.testing.purposes.only',
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"TOA Requester","role":"requester"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333'::uuid,
    'authenticated',
    'authenticated',
    'receiver@toagroup.com',
    '$2a$10$mock.encrypted.password.hash.for.testing.purposes.only',
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"TOA Receiver","role":"receiver"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

-- Insert corresponding profiles (will be created by trigger or manually)
INSERT INTO public.profiles (
  id,
  full_name,
  employee_id,
  company,
  department,
  division,
  role,
  avatar_url
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'TOA Admin',
    'EMP-ADMIN-001',
    'TOA Group',
    'Information Technology',
    'Digital Solutions',
    'fa_admin',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=admin'
  ),
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'TOA Requester',
    'EMP-REQ-001',
    'TOA Group',
    'Information Technology',
    'Digital Solutions',
    'requester',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=requester'
  ),
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    'TOA Receiver',
    'EMP-REC-001',
    'TOA Group',
    'Information Technology',
    'Digital Solutions',
    'receiver',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=receiver'
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  employee_id = EXCLUDED.employee_id,
  company = EXCLUDED.company,
  department = EXCLUDED.department,
  division = EXCLUDED.division,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url;

-- Update RLS policies to work with real authenticated users
DROP POLICY IF EXISTS "Allow profile access" ON public.profiles;
DROP POLICY IF EXISTS "Allow request creation" ON public.requests;
DROP POLICY IF EXISTS "Allow request viewing" ON public.requests;
DROP POLICY IF EXISTS "Allow request updates" ON public.requests;

-- Create standard RLS policies for authenticated users
CREATE POLICY "Users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can do everything with profiles" 
  ON public.profiles 
  FOR ALL 
  USING (public.is_fa_admin())
  WITH CHECK (public.is_fa_admin());

-- Standard request policies
CREATE POLICY "Requesters can create requests"
  ON public.requests 
  FOR INSERT
  WITH CHECK (
    auth.uid() = requester_id 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('requester', 'fa_admin')
    )
  );

CREATE POLICY "Users can view relevant requests"
  ON public.requests 
  FOR SELECT
  USING (
    requester_id = auth.uid()
    OR public.is_fa_admin()
    OR (status = 'approved' AND receiver_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Users can update own requests"
  ON public.requests 
  FOR UPDATE
  USING (
    (requester_id = auth.uid() AND status IN ('pending', 'rework'))
    OR public.is_fa_admin()
  );
