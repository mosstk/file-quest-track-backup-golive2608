# คู่มือแก้ไขปัญหา (Troubleshooting Guide)

## ปัญหาที่พบบ่อยและวิธีการแก้ไข

### 1. ปัญหาการแสดงข้อมูลในหน้ารายงาน (Reports Page Issues)

#### 1.1 ปัญหา: ข้อมูลไม่แสดงเลย (No Data Display)
**อาการ**: หน้ารายงานแสดง 0 ทุกค่า ไม่มีข้อมูลแสดง

**สาเหตุ**: 
- RLS policies ไม่อนุญาตให้ดึงข้อมูลจากตาราง requests ตรงๆ
- Function `get_all_requests()` ไม่ครอบคลุมฟิลด์ที่จำเป็น

**วิธีแก้ไข**:
```typescript
// ใช้ function แทนการ query ตรงๆ
const { data: requests, error: requestsError } = await supabase
  .rpc('get_all_requests'); // แทนที่จะใช้ .from('requests')
```

#### 1.2 ปัญหา: ข้อมูลผู้รับเอกสารไม่ถูกต้อง (Receiver Data Issues)
**อาการ**: จำนวนประเทศ/บริษัทผู้รับแสดง 0 แม้ว่าจะมีข้อมูลในฐานข้อมูล

**สาเหตุ**: Function `get_all_requests()` ไม่ return ฟิลด์ `country_name` และ `receiver_company`

**วิธีแก้ไข**:
```sql
-- อัพเดต function เพื่อรวมฟิลด์ผู้รับ
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
  -- ... ฟิลด์อื่นๆ
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
    -- ... ฟิลด์อื่นๆ
  FROM public.requests r
  LEFT JOIN public.profiles p ON r.requester_id = p.id
  ORDER BY r.created_at DESC;
END;
$$;
```

### 2. ปัญหา TypeScript Errors

#### 2.1 ปัญหา: Property does not exist on type
**อาการ**: 
```
Property 'country_name' does not exist on type
Property 'receiver_company' does not exist on type
```

**วิธีแก้ไข**:
```typescript
// ใช้ type assertion เมื่อ TypeScript ไม่รู้จักฟิลด์
const uniqueCountries = new Set(
  requests?.filter(r => (r as any).country_name).map(r => (r as any).country_name) || []
);
```

### 3. ปัญหา Authentication

#### 3.1 ปัญหา: "Invalid login credentials"
**อาการ**: ล็อกอินไม่ได้แม้ว่า username/password จะถูกต้อง

**สาเหตุ**: ระบบใช้ Custom Authentication แทน Supabase Auth

**วิธีแก้ไข**:
```typescript
// ตรวจสอบว่าใช้ custom auth function
const { data: userData } = await supabase
  .from('profiles')
  .select('*')
  .eq('username', username)
  .eq('password', password)
  .eq('is_active', true)
  .single();
```

### 4. ปัญหา Database Functions

#### 4.1 ปัญหา: "cannot change return type of existing function"
**อาการ**: ไม่สามารถ update function ที่มี return type ต่างจากเดิม

**วิธีแก้ไข**:
```sql
-- ต้อง DROP function ก่อนแล้วค่อย CREATE ใหม่
DROP FUNCTION public.get_all_requests();
CREATE OR REPLACE FUNCTION public.get_all_requests()
-- ... function definition
```

#### 4.2 ปัญหา: RLS Policy Conflicts
**อาการ**: ไม่สามารถดึงข้อมูลได้แม้ว่าจะมีสิทธิ์

**วิธีแก้ไข**:
```sql
-- ใช้ SECURITY DEFINER ใน function เพื่อข้าม RLS
CREATE OR REPLACE FUNCTION public.get_all_requests()
-- ...
LANGUAGE plpgsql
SECURITY DEFINER  -- สำคัญ!
```

### 5. ปัญหา Performance

#### 5.1 ปัญหา: การโหลดช้า
**อาการ**: หน้าเว็บโหลดนาน โดยเฉพาะหน้ารายงาน

**วิธีแก้ไข**:
1. เพิ่ม indexes ที่จำเป็น:
```sql
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_requester_id ON requests(requester_id);
```

2. จำกัดข้อมูลที่ดึงมา:
```typescript
// ดึงเฉพาะข้อมูลที่จำเป็นสำหรับรายงาน
const { data: recentRequests } = await supabase
  .rpc('get_all_requests')
  .limit(100); // จำกัดจำนวน
```

### 6. ปัญหา UI/UX

#### 6.1 ปัญหา: Mobile Responsive
**อาการ**: หน้าเว็บแสดงผลไม่ดีบนมือถือ

**วิธีแก้ไข**:
```typescript
// ใช้ responsive classes ของ Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
```

#### 6.2 ปัญหา: Toast ไม่แสดง
**อาการ**: การแจ้งเตือนไม่ปรากฏ

**วิธีแก้ไข**:
```typescript
// ตรวจสอบว่ามี Toaster component ใน main layout
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      {/* ... app content */}
      <Toaster />
    </>
  );
}
```

### 7. วิธีการ Debug

#### 7.1 เช็ค Console Logs
```typescript
// เพิ่ม logging ในจุดสำคัญ
console.log('Fetched requests:', requests);
console.log('Request error:', requestsError);
```

#### 7.2 เช็ค Network Requests
1. เปิด Developer Tools (F12)
2. ไปที่แท็บ Network
3. ดูว่า API calls ส่งกลับข้อมูลอะไร

#### 7.3 เช็ค Supabase Dashboard
1. ไปที่ Supabase Dashboard
2. เช็ค Table Editor เพื่อดูข้อมูลจริง
3. เช็ค SQL Editor เพื่อทดสอบ queries
4. เช็ค Logs เพื่อดู errors

### 8. การ Backup และ Recovery

#### 8.1 Backup Database
```sql
-- Export ข้อมูลสำคัญ
COPY (SELECT * FROM profiles) TO '/path/to/profiles_backup.csv' CSV HEADER;
COPY (SELECT * FROM requests) TO '/path/to/requests_backup.csv' CSV HEADER;
```

#### 8.2 Recovery Procedures
1. สำรอง migrations ทั้งหมด
2. เก็บ environment variables ไว้ที่ปลอดภัย
3. มี rollback plan สำหรับ database changes

### 9. การ Monitor ระบบ

#### 9.1 Health Check
```typescript
// ฟังก์ชันเช็คการเชื่อมต่อฐานข้อมูล
const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'error', error };
  }
};
```

#### 9.2 Performance Monitoring
```typescript
// ตรวจสอบเวลาในการโหลดข้อมูล
const startTime = performance.now();
const { data } = await supabase.rpc('get_all_requests');
const endTime = performance.now();
console.log(`Query took ${endTime - startTime} milliseconds`);
```

### 10. Best Practices

#### 10.1 Code Organization
- แยก business logic ออกจาก UI components
- ใช้ custom hooks สำหรับ data fetching
- จัดกลุม utility functions ให้เป็นระเบียบ

#### 10.2 Error Handling
```typescript
// Handle errors gracefully
try {
  const { data, error } = await supabase.rpc('some_function');
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Operation failed:', error);
  toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
  return null;
}
```

#### 10.3 Security
- ใช้ RLS policies อย่างถูกต้อง
- ไม่เก็บ sensitive data ใน client-side
- ตรวจสอบ permissions ในทุก operation

## การติดต่อขอความช่วยเหลือ

หากพบปัญหาที่ไม่สามารถแก้ไขได้ด้วยคู่มือนี้:

1. ตรวจสอบ console logs และ network requests
2. เก็บ error messages ที่เกิดขึ้น
3. บันทึกขั้นตอนที่ทำให้เกิดปัญหา
4. เตรียมข้อมูล environment และ version ที่ใช้