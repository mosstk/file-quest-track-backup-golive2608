-- Add is_active field to profiles table if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Update existing profiles to be active
UPDATE public.profiles 
SET is_active = true 
WHERE is_active IS NULL;

-- Update usernames for existing profiles if they don't have one
UPDATE public.profiles 
SET username = CASE 
  WHEN role = 'fa_admin' AND username IS NULL THEN 'admin'
  WHEN role = 'requester' AND username IS NULL THEN 'requester'
  WHEN role = 'receiver' AND username IS NULL THEN 'receiver'
  ELSE COALESCE(username, employee_id)
END 
WHERE username IS NULL OR username = '';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);