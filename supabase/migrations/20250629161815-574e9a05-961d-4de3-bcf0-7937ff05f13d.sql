
-- Update the handle_new_user function to extract additional metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, employee_id, company, department, division)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'requester'),
    new.raw_user_meta_data->>'employee_id',
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'division'
  );
  return new;
end;
$$;
