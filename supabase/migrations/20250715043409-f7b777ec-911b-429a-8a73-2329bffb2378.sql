-- สร้าง function สำหรับยืนยันการได้รับเอกสาร
CREATE OR REPLACE FUNCTION public.confirm_delivery(
  p_request_id uuid,
  p_receiver_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record record;
  receiver_email text;
  updated_request record;
BEGIN
  -- ดึงข้อมูลผู้รับจาก profiles
  SELECT email INTO receiver_email 
  FROM public.profiles 
  WHERE id = p_receiver_id AND is_active = true;
  
  -- ตรวจสอบว่าผู้ใช้เป็นผู้รับของคำขอนี้หรือไม่
  SELECT * INTO request_record
  FROM public.requests 
  WHERE id = p_request_id;
  
  IF request_record IS NULL THEN
    RAISE EXCEPTION 'ไม่พบคำขอที่ต้องการ';
  END IF;
  
  IF request_record.receiver_email != receiver_email THEN
    RAISE EXCEPTION 'ไม่มีสิทธิ์ในการยืนยันการได้รับเอกสารนี้';
  END IF;
  
  IF request_record.status != 'approved' THEN
    RAISE EXCEPTION 'คำขอยังไม่ได้รับการอนุมัติ';
  END IF;
  
  IF request_record.is_delivered = true THEN
    RAISE EXCEPTION 'เอกสารได้รับการยืนยันแล้ว';
  END IF;
  
  -- อัปเดตสถานะการได้รับเอกสาร
  UPDATE public.requests 
  SET 
    is_delivered = true,
    status = 'completed',
    updated_at = now()
  WHERE id = p_request_id
  RETURNING * INTO updated_request;
  
  RETURN json_build_object(
    'success', true,
    'message', 'ยืนยันการได้รับเอกสารเรียบร้อย',
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