-- สร้าง function ที่ใช้ raw SQL และ SECURITY DEFINER เพื่อ bypass RLS ทั้งหมด
CREATE OR REPLACE FUNCTION public.force_delete_user_admin(
  target_user_id uuid,
  admin_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION public.force_delete_user_admin TO authenticated;