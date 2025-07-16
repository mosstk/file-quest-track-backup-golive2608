-- ลบ function เดิมและสร้างใหม่เพื่อเพิ่มข้อมูลผู้รับ
DROP FUNCTION public.get_all_requests();

CREATE OR REPLACE FUNCTION public.get_all_requests()
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  requester_id uuid,
  document_name text,
  receiver_email text,
  receiver_name text,
  receiver_company text,
  receiver_department text,
  receiver_phone text,
  country_name text,
  document_count integer,
  file_path text,
  status public.request_status,
  tracking_number text,
  admin_feedback text,
  is_delivered boolean,
  approved_by uuid,
  shipping_vendor text,
  requester_name text,
  requester_email text,
  requester_employee_id text,
  requester_company text,
  requester_department text,
  requester_division text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;