-- แก้ไข role ของ user ที่มี full_name เป็น "Requester" ให้เป็น requester จริง ๆ
UPDATE public.profiles 
SET role = 'requester' 
WHERE id = 'e6a715a1-2c47-4d45-804d-68dfcb04f613' 
  AND full_name = 'Requester';