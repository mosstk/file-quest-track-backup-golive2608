-- Fix database security issues by setting proper search_path for all functions

-- Function: sync_user_display_name
CREATE OR REPLACE FUNCTION public.sync_user_display_name()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  profile_record record;
BEGIN
  -- Loop through all profiles and update auth metadata
  FOR profile_record IN 
    SELECT id, full_name, email 
    FROM public.profiles 
    WHERE full_name IS NOT NULL
  LOOP
    -- Update the auth.users metadata
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('display_name', profile_record.full_name)
    WHERE id = profile_record.id;
  END LOOP;
END;
$function$;

-- Function: test_rework_status
CREATE OR REPLACE FUNCTION public.test_rework_status(p_request_id uuid, p_feedback text)
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
$function$;

-- Function: admin_delete_user
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    current_user_role text;
    deleted_user json;
BEGIN
    -- ตรวจสอบว่าผู้ใช้ปัจจุบันเป็น fa_admin หรือไม่
    SELECT role INTO current_user_role 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- ถ้าไม่ใช่ fa_admin ให้ throw error
    IF current_user_role != 'fa_admin' THEN
        RAISE EXCEPTION 'ไม่มีสิทธิ์ในการลบผู้ใช้งาน';
    END IF;
    
    -- ป้องกันการลบตัวเอง
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'ไม่สามารถลบบัญชีของตัวเองได้';
    END IF;
    
    -- ลบผู้ใช้และ return ข้อมูลที่ลบ
    DELETE FROM public.profiles 
    WHERE id = target_user_id
    RETURNING to_json(profiles.*) INTO deleted_user;
    
    -- ถ้าไม่มีข้อมูลถูกลบ
    IF deleted_user IS NULL THEN
        RAISE EXCEPTION 'ไม่พบผู้ใช้งานที่ต้องการลบ';
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'deleted_user', deleted_user
    );
END;
$function$;

-- Function: approve_request (first version)
CREATE OR REPLACE FUNCTION public.approve_request(p_request_id uuid, p_tracking_number text, p_admin_id uuid)
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

-- Function: create_request
CREATE OR REPLACE FUNCTION public.create_request(p_document_name text, p_receiver_email text, p_file_path text DEFAULT NULL::text, p_requester_id uuid DEFAULT NULL::uuid, p_document_count integer DEFAULT 1, p_receiver_name text DEFAULT NULL::text, p_receiver_department text DEFAULT NULL::text, p_country_name text DEFAULT NULL::text, p_receiver_company text DEFAULT NULL::text, p_receiver_phone text DEFAULT NULL::text, p_shipping_vendor text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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

-- Function: force_delete_user_admin
CREATE OR REPLACE FUNCTION public.force_delete_user_admin(target_user_id uuid, admin_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    admin_role text;
    deleted_count integer;
    deleted_user_data json;
BEGIN
    -- ตรวจสอบว่า admin_user_id เป็น fa_admin หรือไม่
    SELECT role INTO admin_role 
    FROM public.profiles 
    WHERE id = admin_user_id;
    
    -- ถ้าไม่ใช่ fa_admin ให้ return error
    IF admin_role IS NULL OR admin_role != 'fa_admin' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized: Admin privileges required'
        );
    END IF;
    
    -- ป้องกันการลบตัวเอง
    IF target_user_id = admin_user_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Cannot delete your own account'
        );
    END IF;
    
    -- เก็บข้อมูล user ก่อนลบ
    SELECT to_json(profiles.*) INTO deleted_user_data
    FROM public.profiles 
    WHERE id = target_user_id;
    
    -- ถ้าไม่พบ user
    IF deleted_user_data IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- ลบ user โดยใช้ raw SQL (bypass RLS ทั้งหมด)
    EXECUTE format('DELETE FROM public.profiles WHERE id = %L', target_user_id);
    
    -- ตรวจสอบว่าลบสำเร็จหรือไม่
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count = 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Failed to delete user'
        );
    END IF;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'message', 'User deleted successfully',
        'deleted_user', deleted_user_data,
        'deleted_count', deleted_count
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$function$;

-- Function: confirm_delivery
CREATE OR REPLACE FUNCTION public.confirm_delivery(p_request_id uuid, p_receiver_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;