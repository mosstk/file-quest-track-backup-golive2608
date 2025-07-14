-- Update requester password to match the login form
UPDATE public.profiles 
SET password = 'requester' 
WHERE username = 'requester' AND id = '22222222-2222-2222-2222-222222222222';