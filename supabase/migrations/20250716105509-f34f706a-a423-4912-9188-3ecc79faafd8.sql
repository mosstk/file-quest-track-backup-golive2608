-- Update create_request function to include shipping_vendor parameter
CREATE OR REPLACE FUNCTION public.create_request(
  p_document_name text, 
  p_receiver_email text, 
  p_file_path text DEFAULT NULL::text, 
  p_requester_id uuid DEFAULT NULL::uuid, 
  p_document_count integer DEFAULT 1, 
  p_receiver_name text DEFAULT NULL::text, 
  p_receiver_department text DEFAULT NULL::text, 
  p_country_name text DEFAULT NULL::text, 
  p_receiver_company text DEFAULT NULL::text, 
  p_receiver_phone text DEFAULT NULL::text,
  p_shipping_vendor text DEFAULT NULL::text
)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result_record public.requests;
  actual_requester_id UUID;
BEGIN
  -- ใช้ requester_id ที่ส่งมา หรือ auth.uid() หรือ mock admin id
  actual_requester_id := COALESCE(
    p_requester_id,
    auth.uid(),
    '11111111-1111-1111-1111-111111111111'::uuid
  );
  
  -- Insert request
  INSERT INTO public.requests (
    document_name,
    receiver_email,
    file_path,
    requester_id,
    status,
    document_count,
    receiver_name,
    receiver_department,
    country_name,
    receiver_company,
    receiver_phone,
    shipping_vendor
  )
  VALUES (
    p_document_name,
    p_receiver_email,
    p_file_path,
    actual_requester_id,
    'pending',
    p_document_count,
    p_receiver_name,
    p_receiver_department,
    p_country_name,
    p_receiver_company,
    p_receiver_phone,
    p_shipping_vendor
  )
  RETURNING * INTO result_record;
  
  -- Return as JSON
  RETURN row_to_json(result_record);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$function$;