-- Update requester password to match the login form
UPDATE public.profiles 
SET password = 'requester' 
WHERE username = 'requester' AND id = '22222222-2222-2222-2222-222222222222';

-- Clean up users without username/password (these seem to be from old auth system)
DELETE FROM public.profiles 
WHERE username IS NULL OR password IS NULL;