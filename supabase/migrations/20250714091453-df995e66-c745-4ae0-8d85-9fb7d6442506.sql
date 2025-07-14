-- เพิ่มคอลัมน์ email ลงในตาราง profiles
ALTER TABLE public.profiles 
ADD COLUMN email TEXT;

-- คัดลอกข้อมูลจาก username ไปยัง email (สำหรับข้อมูลที่มีอยู่แล้ว)
UPDATE public.profiles 
SET email = username 
WHERE username IS NOT NULL;

-- สร้าง index สำหรับการค้นหาอีเมลได้เร็วขึ้น
CREATE INDEX idx_profiles_email ON public.profiles(email);