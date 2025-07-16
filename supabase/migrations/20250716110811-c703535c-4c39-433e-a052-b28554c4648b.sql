-- Drop the old create_request function without shipping_vendor parameter
DROP FUNCTION IF EXISTS public.create_request(text, text, text, uuid, integer, text, text, text, text, text);