-- Continue fixing remaining database functions security issues

-- Function: approve_request (with shipping_vendor)
CREATE OR REPLACE FUNCTION public.approve_request(p_request_id uuid, p_tracking_number text, p_admin_id uuid, p_shipping_vendor text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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

-- Function: test_rejected_status
CREATE OR REPLACE FUNCTION public.test_rejected_status(p_request_id uuid, p_feedback text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Function: can_insert_profile
CREATE OR REPLACE FUNCTION public.can_insert_profile(profile_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT (auth.uid() = profile_user_id) OR public.is_fa_admin();
$function$;

-- Function: get_current_user_id
CREATE OR REPLACE FUNCTION public.get_current_user_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  -- ถ้าเป็น authenticated user ให้ใช้ auth.uid()
  -- ถ้าไม่ใช่ ให้ return mock admin id สำหรับการทดสอบ
  SELECT COALESCE(
    auth.uid(),
    '11111111-1111-1111-1111-111111111111'::uuid
  );
$function$;

-- Function: update_request
CREATE OR REPLACE FUNCTION public.update_request(p_request_id uuid, p_document_name text, p_receiver_email text, p_document_count integer DEFAULT NULL::integer, p_receiver_name text DEFAULT NULL::text, p_receiver_department text DEFAULT NULL::text, p_country_name text DEFAULT NULL::text, p_receiver_company text DEFAULT NULL::text, p_receiver_phone text DEFAULT NULL::text, p_file_path text DEFAULT NULL::text, p_shipping_vendor text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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

-- Function: get_all_requests
CREATE OR REPLACE FUNCTION public.get_all_requests()
 RETURNS TABLE(id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, requester_id uuid, document_name text, receiver_email text, receiver_name text, receiver_company text, receiver_department text, receiver_phone text, country_name text, document_count integer, file_path text, status request_status, tracking_number text, admin_feedback text, is_delivered boolean, approved_by uuid, shipping_vendor text, requester_name text, requester_email text, requester_employee_id text, requester_company text, requester_department text, requester_division text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.created_at,
    r.updated_at,
    r.requester_id,
    r.document_name,
    r.receiver_email,
    r.receiver_name,
    r.receiver_company,
    r.receiver_department,
    r.receiver_phone,
    r.country_name,
    r.document_count,
    r.file_path,
    r.status,
    r.tracking_number,
    r.admin_feedback,
    r.is_delivered,
    r.approved_by,
    r.shipping_vendor,
    p.full_name as requester_name,
    COALESCE(p.email, p.username) as requester_email,
    p.employee_id as requester_employee_id,
    p.company as requester_company,
    p.department as requester_department,
    p.division as requester_division
  FROM public.requests r
  LEFT JOIN public.profiles p ON r.requester_id = p.id
  ORDER BY r.created_at DESC;
END;
$function$;

-- Function: is_fa_admin
CREATE OR REPLACE FUNCTION public.is_fa_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'fa_admin'
  );
$function$;

-- Function: is_mock_user
CREATE OR REPLACE FUNCTION public.is_mock_user(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND full_name LIKE 'Test %'
  );
$function$;

-- Function: is_mock_user_by_id
CREATE OR REPLACE FUNCTION public.is_mock_user_by_id(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT user_id IN (
    '11111111-1111-1111-1111-111111111111'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid
  );
$function$;