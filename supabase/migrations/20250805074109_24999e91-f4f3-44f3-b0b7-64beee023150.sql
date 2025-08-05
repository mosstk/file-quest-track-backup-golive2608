-- สร้าง function สำหรับทดสอบการ update status เป็น rework
CREATE OR REPLACE FUNCTION public.test_rework_status(p_request_id uuid, p_feedback text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_request record;
BEGIN
  -- อัปเดตคำขอ
  UPDATE public.requests 
  SET 
    status = 'rework',
    admin_feedback = p_feedback,
    updated_at = now()
  WHERE id = p_request_id
  RETURNING * INTO updated_request;
  
  -- ถ้าไม่มีข้อมูลถูกอัปเดต
  IF updated_request IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ไม่พบคำขอที่ต้องการ'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'อัปเดตสถานะเป็น rework เรียบร้อย',
    'data', row_to_json(updated_request)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- สร้าง function สำหรับทดสอบการ update status เป็น rejected
CREATE OR REPLACE FUNCTION public.test_rejected_status(p_request_id uuid, p_feedback text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_request record;
BEGIN
  -- อัปเดตคำขอ
  UPDATE public.requests 
  SET 
    status = 'rejected',
    admin_feedback = p_feedback,
    updated_at = now()
  WHERE id = p_request_id
  RETURNING * INTO updated_request;
  
  -- ถ้าไม่มีข้อมูลถูกอัปเดต
  IF updated_request IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ไม่พบคำขอที่ต้องการ'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'อัปเดตสถานะเป็น rejected เรียบร้อย',
    'data', row_to_json(updated_request)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;