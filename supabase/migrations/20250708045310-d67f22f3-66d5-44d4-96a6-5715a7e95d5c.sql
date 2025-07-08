-- Set usernames for existing test users to enable login
UPDATE public.profiles 
SET username = 'admin', password = 'admin123' 
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.profiles 
SET username = 'requester', password = 'req123' 
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE public.profiles 
SET username = 'receiver', password = 'rec123' 
WHERE id = '33333333-3333-3333-3333-333333333333';