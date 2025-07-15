-- เพิ่มสถานะ 'completed' ใน request_status enum
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'completed';