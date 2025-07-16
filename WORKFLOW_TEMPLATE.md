# แนวทางการสร้างระบบจัดการคำขอส่งเอกสาร

## คำสั่งการติดตั้งและสร้างระบบ

### 1. สร้างโปรเจค
```bash
npm create vite@latest document-request-system -- --template react-ts
cd document-request-system
npm install
```

### 2. ติดตั้ง Dependencies
```bash
npm install @supabase/supabase-js react-router-dom @tanstack/react-query
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install tailwindcss tailwindcss-animate clsx tailwind-merge
npm install class-variance-authority lucide-react date-fns
npm install react-hook-form @hookform/resolvers zod sonner xlsx
```

### 3. ตั้งค่า Supabase
- สร้างโปรเจค Supabase ใหม่
- รัน migrations ตามลำดับในโฟลเดอร์ `supabase/migrations/`
- ตั้งค่า Environment Variables

### 4. สร้างฐานข้อมูล
```sql
-- ตาราง profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT,
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'requester',
  -- ... ฟิลด์อื่นๆ
);

-- ตาราง requests  
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT NOT NULL,
  receiver_email TEXT NOT NULL,
  country_name TEXT,
  receiver_company TEXT,
  -- ... ฟิลด์อื่นๆ
);
```

### 5. สร้าง Functions
```sql
-- Function get_all_requests (ต้องรวมฟิลด์ country_name, receiver_company)
CREATE OR REPLACE FUNCTION public.get_all_requests()
RETURNS TABLE (
  -- รวมฟิลด์ทั้งหมดที่จำเป็น
  country_name text,
  receiver_company text,
  -- ... ฟิลด์อื่นๆ
)
LANGUAGE plpgsql SECURITY DEFINER;
```

## สาเหตุปัญหาหลักและวิธีแก้ไข

### ปัญหา 1: ข้อมูลไม่แสดงในหน้ารายงาน
**แก้ไข**: ใช้ `supabase.rpc('get_all_requests')` แทน `.from('requests')`

### ปัญหา 2: ข้อมูลผู้รับไม่ถูกต้อง  
**แก้ไข**: อัพเดต function `get_all_requests()` ให้รวมฟิลด์ `country_name` และ `receiver_company`

### ปัญหา 3: TypeScript Errors
**แก้ไข**: ใช้ `(r as any).field_name` สำหรับฟิลด์ที่ TypeScript ไม่รู้จัก

ผมได้สร้างเอกสารครบถ้วนแล้ว:
- **SYSTEM_DOCUMENTATION.md** - เอกสารระบบโดยรวม
- **TROUBLESHOOTING_GUIDE.md** - คู่มือแก้ไขปัญหา  
- **WORKFLOW_TEMPLATE.md** - แนวทางการสร้างระบบ

เอกสารเหล่านี้ครอบคลุมทุกปัญหาที่เคยพบและวิธีการแก้ไขที่ใช้ได้จริงครับ