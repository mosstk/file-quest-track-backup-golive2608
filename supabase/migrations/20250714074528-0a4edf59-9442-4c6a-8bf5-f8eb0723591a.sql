-- Check and fix unique constraints on employee_id
-- Remove the unique constraint on employee_id if it exists
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_employee_id_key;

-- Also check for other potential unique constraints
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS unique_employee_id;

-- Add a new unique constraint only if we want it (optional)
-- For now, let's allow duplicate employee_ids for testing
-- ALTER TABLE public.profiles 
-- ADD CONSTRAINT unique_employee_id UNIQUE (employee_id);