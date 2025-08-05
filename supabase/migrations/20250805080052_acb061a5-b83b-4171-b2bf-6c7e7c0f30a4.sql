-- สร้าง function สำหรับอัปเดทคำขอ
CREATE OR REPLACE FUNCTION public.update_request(
  p_request_id uuid,
  p_document_name text,
  p_receiver_email text,
  p_document_count integer DEFAULT NULL,
  p_receiver_name text DEFAULT NULL,
  p_receiver_department text DEFAULT NULL,
  p_country_name text DEFAULT NULL,
  p_receiver_company text DEFAULT NULL,
  p_receiver_phone text DEFAULT NULL,
  p_file_path text DEFAULT NULL,
  p_shipping_vendor text DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  updated_request record;
BEGIN
  -- อัปเดตคำขอ
  UPDATE public.requests 
  SET 
    document_name = p_document_name,
    receiver_email = p_receiver_email,
    document_count = COALESCE(p_document_count, document_count),
    receiver_name = COALESCE(p_receiver_name, receiver_name),
    receiver_department = COALESCE(p_receiver_department, receiver_department),
    country_name = COALESCE(p_country_name, country_name),
    receiver_company = COALESCE(p_receiver_company, receiver_company),
    receiver_phone = COALESCE(p_receiver_phone, receiver_phone),
    file_path = COALESCE(p_file_path, file_path),
    shipping_vendor = COALESCE(p_shipping_vendor, shipping_vendor),
    updated_at = now()
  WHERE id = p_request_id
  RETURNING * INTO updated_request;
  
  -- ถ้าไม่มีข้อมูลถูกอัปเดต
  IF updated_request IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ไม่พบคำขอที่ต้องการอัปเดต'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'อัปเดตคำขอเรียบร้อย',
    'data', row_to_json(updated_request)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;