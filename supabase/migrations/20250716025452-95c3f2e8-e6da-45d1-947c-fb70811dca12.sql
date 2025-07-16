-- Add missing fields to requests table
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS document_count integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS receiver_name text,
ADD COLUMN IF NOT EXISTS receiver_department text,
ADD COLUMN IF NOT EXISTS country_name text,
ADD COLUMN IF NOT EXISTS receiver_company text,
ADD COLUMN IF NOT EXISTS receiver_phone text;

-- Update create_request function to include new fields
CREATE OR REPLACE FUNCTION public.create_request(
  p_document_name text,
  p_receiver_email text,
  p_file_path text DEFAULT NULL,
  p_requester_id uuid DEFAULT NULL,
  p_document_count integer DEFAULT 1,
  p_receiver_name text DEFAULT NULL,
  p_receiver_department text DEFAULT NULL,
  p_country_name text DEFAULT NULL,
  p_receiver_company text DEFAULT NULL,
  p_receiver_phone text DEFAULT NULL
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
    receiver_phone
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
    p_receiver_phone
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