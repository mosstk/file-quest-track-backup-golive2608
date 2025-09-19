-- Fix the remaining function security issue

-- Function: handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$function$;

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;