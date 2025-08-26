-- Function to update auth user metadata with display name from profiles
CREATE OR REPLACE FUNCTION public.sync_user_display_name()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record record;
BEGIN
  -- Loop through all profiles and update auth metadata
  FOR profile_record IN 
    SELECT id, full_name, email 
    FROM public.profiles 
    WHERE full_name IS NOT NULL
  LOOP
    -- Update the auth.users metadata
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('display_name', profile_record.full_name)
    WHERE id = profile_record.id;
  END LOOP;
END;
$$;

-- Run the function to update existing users
SELECT public.sync_user_display_name();

-- Update the handle_new_user function to include display_name in metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, avatar_url, role, employee_id, company, department, division, email, username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'requester'),
    new.raw_user_meta_data->>'employee_id',
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'division',
    new.email,
    coalesce(new.raw_user_meta_data->>'username', new.email)
  );
  
  -- Update auth metadata with display_name if full_name exists
  IF new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('display_name', new.raw_user_meta_data->>'full_name')
    WHERE id = new.id;
  END IF;
  
  RETURN new;
END;
$$;