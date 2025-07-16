-- Update approve_request function to include shipping_vendor parameter
CREATE OR REPLACE FUNCTION public.approve_request(
  p_request_id uuid, 
  p_tracking_number text, 
  p_admin_id uuid,
  p_shipping_vendor text
)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  admin_role text;
  updated_request record;
BEGIN
  -- ตรวจสอบว่าผู้ใช้เป็น fa_admin หรือไม่
  SELECT role INTO admin_role 
  FROM public.profiles 
  WHERE id = p_admin_id AND is_active = true;
  
  -- ถ้าไม่ใช่ fa_admin ให้ throw error
  IF admin_role != 'fa_admin' THEN
    RAISE EXCEPTION 'ไม่มีสิทธิ์ในการอนุมัติคำขอ';
  END IF;
  
  -- อัปเดตคำขอ
  UPDATE public.requests 
  SET 
    status = 'approved',
    tracking_number = p_tracking_number,
    approved_by = p_admin_id,
    shipping_vendor = p_shipping_vendor,
    updated_at = now()
  WHERE id = p_request_id
  RETURNING * INTO updated_request;
  
  -- ถ้าไม่มีข้อมูลถูกอัปเดต
  IF updated_request IS NULL THEN
    RAISE EXCEPTION 'ไม่พบคำขอที่ต้องการอนุมัติ';
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'อนุมัติคำขอเรียบร้อย',
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