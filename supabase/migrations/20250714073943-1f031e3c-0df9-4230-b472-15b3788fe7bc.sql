-- Remove foreign key constraint that's causing the issue
-- This will allow us to create profiles without requiring auth.users entries

-- First, drop the foreign key constraint if it exists
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Also drop any other potential foreign key constraints related to auth.users
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Make sure the id column doesn't have any foreign key constraints
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS fk_profiles_auth_users;