-- Step 1: Update the empty auth profile with the complete data
UPDATE public.profiles 
SET 
  full_name = 'Supasinee Banchongsawat',
  email = 'supasinee_b@toagroup.com',
  username = 'supasinee_b@toagroup.com',
  employee_id = '11111',
  company = 'TOAPTH',
  department = 'Finance',
  division = 'Treasury',
  password = '11111'
WHERE id = 'a0e2ecc0-bfa7-4892-b581-925d27303b17'::uuid;

-- Step 2: Update all requests to use the auth.uid()
UPDATE public.requests 
SET requester_id = 'a0e2ecc0-bfa7-4892-b581-925d27303b17'::uuid
WHERE requester_id = 'd070d057-08c7-4bb1-b6d1-e73e16983e39'::uuid;

-- Step 3: Delete the old duplicate profile
DELETE FROM public.profiles 
WHERE id = 'd070d057-08c7-4bb1-b6d1-e73e16983e39'::uuid;