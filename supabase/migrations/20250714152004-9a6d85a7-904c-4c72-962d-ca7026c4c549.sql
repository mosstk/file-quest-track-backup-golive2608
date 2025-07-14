-- ลบ policy ทั้งหมดที่เกี่ยวข้องกับ DELETE บน profiles table
DROP POLICY IF EXISTS "Allow admin delete all" ON public.profiles;
DROP POLICY IF EXISTS "fa_admin_can_delete" ON public.profiles;
DROP POLICY IF EXISTS "Admin delete policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "FA Admins can delete other profiles" ON public.profiles;

-- สร้าง function สำหรับลบ user แบบ security definer
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- สร้าง policy ใหม่ที่อนุญาตให้ admins เรียกใช้ function นี้
GRANT EXECUTE ON FUNCTION public.admin_delete_user TO authenticated;