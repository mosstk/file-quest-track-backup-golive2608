-- ลบ function เก่าที่มี parameters น้อยกว่า
DROP FUNCTION IF EXISTS public.create_request(text, text, text, uuid);

-- ตรวจสอบว่ามี function ใหม่อยู่แล้ว (จาก migration ล่าสุด)
-- Function นี้รองรับ parameters ครบทั้งเก่าและใหม่