-- Check and fix foreign key constraints to allow user deletion
-- We need to modify the foreign key constraints to allow CASCADE deletion

-- First, check existing constraints and modify them to support CASCADE deletion
-- This will allow deletion of users by automatically deleting related records

-- Drop existing foreign key constraints
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_requester_id_fkey;
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_approved_by_fkey;

-- Recreate foreign key constraints with CASCADE deletion
ALTER TABLE public.requests 
ADD CONSTRAINT requests_requester_id_fkey 
FOREIGN KEY (requester_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.requests 
ADD CONSTRAINT requests_approved_by_fkey 
FOREIGN KEY (approved_by) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;