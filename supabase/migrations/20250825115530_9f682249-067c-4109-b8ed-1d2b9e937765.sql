-- Update the profile record to use the correct auth.uid()
-- and update all related requests to use the new ID

-- First, update all requests to use the new auth user ID
UPDATE public.requests 
SET requester_id = 'a0e2ecc0-bfa7-4892-b581-925d27303b17'::uuid
WHERE requester_id = 'd070d057-08c7-4bb1-b6d1-e73e16983e39'::uuid;

-- Then, update the profile to use the correct auth user ID
UPDATE public.profiles 
SET id = 'a0e2ecc0-bfa7-4892-b581-925d27303b17'::uuid
WHERE id = 'd070d057-08c7-4bb1-b6d1-e73e16983e39'::uuid;