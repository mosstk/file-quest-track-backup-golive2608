-- Fix the remaining function search path issue - handle_updated_at function
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