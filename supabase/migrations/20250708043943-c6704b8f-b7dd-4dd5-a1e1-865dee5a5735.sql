-- Add is_active field to profiles table if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Update existing profiles to be active
UPDATE public.profiles 
SET is_active = true 
WHERE is_active IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);