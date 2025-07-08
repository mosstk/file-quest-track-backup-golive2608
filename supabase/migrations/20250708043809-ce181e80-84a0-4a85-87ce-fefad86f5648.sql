-- Add username and is_active fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;

-- Update existing profiles to have usernames based on role
UPDATE public.profiles 
SET username = CASE 
  WHEN role = 'fa_admin' THEN 'admin'
  WHEN role = 'requester' THEN 'requester'
  WHEN role = 'receiver' THEN 'receiver'
  ELSE employee_id
END 
WHERE username IS NULL;

-- Create index for faster username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);