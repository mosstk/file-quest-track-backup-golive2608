-- สร้าง function สำหรับสร้าง request โดยตรง
CREATE OR REPLACE FUNCTION public.create_request(
  p_document_name TEXT,
  p_receiver_email TEXT,
  p_file_path TEXT DEFAULT NULL,
  p_requester_id UUID DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    status
  )
  VALUES (
    p_document_name,
    p_receiver_email,
    p_file_path,
    actual_requester_id,
    'pending'
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
$$;