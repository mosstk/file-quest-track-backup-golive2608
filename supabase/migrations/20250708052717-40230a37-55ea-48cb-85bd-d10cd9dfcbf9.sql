-- แก้ไข RLS policies สำหรับตาราง profiles เพื่อให้ admin สามารถจัดการผู้ใช้งานได้
-- ลบ policies ที่ซ้ำซ้อนและสร้างใหม่

-- ลบ policies เก่าที่อาจมีปัญหา
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything with profiles" ON public.profiles;

-- สร้าง policies ใหม่ที่ชัดเจนและไม่ซ้ำซ้อน
-- Policy สำหรับการดูข้อมูล profiles
CREATE POLICY "Enable read access for authenticated users" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
);

-- Policy สำหรับการสร้าง profile ใหม่
CREATE POLICY "Enable insert for own profile or admin" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  (auth.uid() = id) OR 
  is_fa_admin() OR 
  is_mock_user_by_id(id)
);

-- Policy สำหรับการแก้ไข profile
CREATE POLICY "Enable update for own profile or admin" 
ON public.profiles 
FOR UPDATE 
USING (
  (auth.uid() = id) OR 
  is_fa_admin() OR 
  is_mock_user_by_id(id)
);

-- Policy สำหรับการลบ profile (เฉพาะ admin)
CREATE POLICY "Enable delete for admin only" 
ON public.profiles 
FOR DELETE 
USING (
  is_fa_admin() OR 
  is_mock_user_by_id(id)
);