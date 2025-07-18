-- อัพเดตชื่อประเทศในฐานข้อมูลให้เป็นภาษาอังกฤษ
UPDATE public.requests 
SET country_name = CASE 
  WHEN LOWER(TRIM(country_name)) = 'ไทย' OR LOWER(TRIM(country_name)) = 'thailand' THEN 'Thailand'
  WHEN LOWER(TRIM(country_name)) = 'เวียดนาม' OR LOWER(TRIM(country_name)) = 'vietnam' THEN 'Vietnam'
  WHEN LOWER(TRIM(country_name)) = 'สหรัฐอเมริกา' OR LOWER(TRIM(country_name)) = 'america' OR LOWER(TRIM(country_name)) = 'united states' THEN 'United States'
  WHEN LOWER(TRIM(country_name)) = 'ลาว' OR LOWER(TRIM(country_name)) = 'laos' THEN 'Laos'
  WHEN LOWER(TRIM(country_name)) = 'มาเลเซีย' OR LOWER(TRIM(country_name)) = 'malaysia' THEN 'Malaysia'
  WHEN LOWER(TRIM(country_name)) = 'อินโดนีเซีย' OR LOWER(TRIM(country_name)) = 'indonesia' THEN 'Indonesia'
  WHEN LOWER(TRIM(country_name)) = 'เมียนมาร์' OR LOWER(TRIM(country_name)) = 'myanmar' THEN 'Myanmar'
  WHEN LOWER(TRIM(country_name)) = 'กัมพูชา' OR LOWER(TRIM(country_name)) = 'cambodia' THEN 'Cambodia'
  ELSE country_name
END
WHERE country_name IS NOT NULL;