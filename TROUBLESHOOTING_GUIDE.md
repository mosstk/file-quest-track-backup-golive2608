# คู่มือแก้ปัญหา (Troubleshooting Guide)

## เคส: User Role และ Dashboard Display ไม่ตรงกัน

### ปัญหาที่เกิดขึ้น
- User มี `full_name` เป็น "Requester" แต่ระบบแสดง AdminDashboard
- ผู้ใช้คาดหวังว่าจะเห็น RequesterDashboard ตาม full_name
- เกิดความสับสนระหว่าง role ในฐานข้อมูลกับสิ่งที่แสดงใน UI

### สาเหตุของปัญหา
1. **ข้อมูลไม่สอดคล้องกัน**: Role ในฐานข้อมูลเป็น `fa_admin` แต่ `full_name` เป็น "Requester"
2. **การแสดงผลถูกต้อง**: ระบบทำงานตาม role จริงในฐานข้อมูล ไม่ใช่ตาม full_name
3. **ความคาดหวังไม่ตรง**: ผู้ใช้คิดว่า full_name จะเป็นตัวกำหนด dashboard

### วิธีการ Debug
1. **ตรวจสอบ Console Logs**
   ```javascript
   console.log('Dashboard - User role:', user.role, 'User data:', user);
   ```

2. **Query ฐานข้อมูลเพื่อยืนยัน**
   ```sql
   SELECT id, full_name, email, role FROM profiles WHERE id = 'user-id';
   ```

3. **ตรวจสอบการทำงานของ Dashboard Router**
   ```javascript
   switch (user.role) {
     case 'fa_admin':
       return <AdminDashboard />;
     case 'requester':
       return <RequesterDashboard />;
     // ...
   }
   ```

### วิธีแก้ไข

#### ขั้นตอนที่ 1: ยืนยันปัญหา
```sql
-- ตรวจสอบข้อมูล user ที่มีปัญหา
SELECT id, full_name, email, role, is_active 
FROM profiles 
WHERE full_name LIKE '%Requester%' OR role != 'requester';
```

#### ขั้นตอนที่ 2: แก้ไขข้อมูลในฐานข้อมูล
```sql
-- แก้ไข role ให้ตรงกับความต้องการ
UPDATE public.profiles 
SET role = 'requester' 
WHERE id = 'user-id' 
  AND full_name = 'Requester';
```

#### ขั้นตอนที่ 3: ตรวจสอบ RLS Policies
```sql
-- ตรวจสอบและปรับปรุง RLS policies
DROP POLICY IF EXISTS "Users can view their own requests" ON public.requests;

CREATE POLICY "Requesters can view only their own requests"
ON public.requests 
FOR SELECT 
USING (requester_id = auth.uid());
```

### การป้องกันปัญหาในอนาคต

#### 1. Data Consistency Validation
- สร้าง validation ให้ full_name สอดคล้องกับ role
- ใช้ trigger หรือ function ตรวจสอบความถูกต้องของข้อมูล

#### 2. Clear Naming Convention
```sql
-- ตัวอย่าง naming convention ที่ชัดเจน
UPDATE profiles SET 
  full_name = CASE 
    WHEN role = 'fa_admin' THEN 'Admin: ' || full_name
    WHEN role = 'requester' THEN 'Requester: ' || full_name
    WHEN role = 'receiver' THEN 'Receiver: ' || full_name
  END;
```

#### 3. Enhanced Debugging
```javascript
// เพิ่ม debug information ใน Dashboard component
const Dashboard = () => {
  const { user, loading } = useAuth();
  
  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('🔍 Dashboard Debug:', {
        userId: user.id,
        role: user.role,
        fullName: user.full_name,
        email: user.email
      });
    }
  }, [user]);
  
  // ... rest of component
};
```

#### 4. Role-based Access Control (RBAC) Best Practices
```javascript
// สร้าง utility function สำหรับตรวจสอบ role
export const hasRole = (user: User, requiredRole: string): boolean => {
  return user?.role === requiredRole;
};

export const canAccessAdminFeatures = (user: User): boolean => {
  return hasRole(user, 'fa_admin');
};
```

### Test Cases สำหรับยืนยันการแก้ไข

#### Test 1: Admin User
```javascript
// Expected: Admin user เห็น AdminDashboard
const adminUser = { role: 'fa_admin', full_name: 'Admin User' };
// Should render: <AdminDashboard />
```

#### Test 2: Requester User  
```javascript
// Expected: Requester user เห็น RequesterDashboard
const requesterUser = { role: 'requester', full_name: 'Requester User' };
// Should render: <RequesterDashboard />
```

#### Test 3: Data Access Rights
```sql
-- Test: Requester ควรเห็นเฉพาะข้อมูลของตัวเอง
-- Test: Admin ควรเห็นข้อมูลทั้งหมด
```

---

## เคสอื่น ๆ ที่พบบ่อย

### เคส: RLS Policy ไม่ทำงาน
**ปัญหา**: User ไม่เห็นข้อมูลที่ควรจะเห็น

**วิธีแก้ไข**:
1. ตรวจสอบ auth.uid() ใน RLS policy
2. ใช้ security definer function หลีกเลี่ยง infinite recursion
3. ทดสอบ policy ด้วย different user roles

### เคส: Dashboard Loading ไม่เสร็จ
**ปัญหา**: Dashboard แสดง loading state ตลอดเวลา

**วิธีแก้ไข**:
1. ตรวจสอบ useAuth hook
2. ยืนยัน user object structure
3. เช็ค network requests ใน browser dev tools

---

## Checklist สำหรับการแก้ปัญหา

- [ ] ตรวจสอบ console logs
- [ ] ยืนยันข้อมูลในฐานข้อมูล
- [ ] ทดสอบ RLS policies
- [ ] ตรวจสอบ user authentication state
- [ ] ยืนยัน component rendering logic
- [ ] ทดสอบกับ different user roles
- [ ] อัพเดท documentation

---

## เคส: สถานะคำขอไม่อัปเดตหลังจากการอนุมัติ

### ปัญหาที่เกิดขึ้น
- Admin กดปุ่มอนุมัติแล้ว
- ระบบแสดงข้อความสำเร็จ
- แต่สถานะในหน้าจอยังคงเป็น "รอการอนุมัติ" ไม่เปลี่ยนเป็น "อนุมัติแล้ว"
- ข้อมูลในฐานข้อมูลยังคงเป็น status: "pending"

### สาเหตุของปัญหา
1. **RLS (Row Level Security) Policy** ป้องกันการอัปเดตข้อมูล
2. การใช้ `supabase.from('requests').update()` โดยตรงไม่สามารถผ่าน RLS policy ได้
3. User ที่ทำการอัปเดตไม่มีสิทธิ์ตาม policy ที่กำหนดไว้

### การ Debug ปัญหา

#### 1. ตรวจสอบ Console Logs
```javascript
console.log('Approving request:', request.id);
console.log('User:', user);
console.log('Update data:', updateData);
console.log('Update result:', updateResult);
```

#### 2. ตรวจสอบข้อมูลในฐานข้อมูล
```sql
SELECT * FROM requests WHERE id = 'request-id';
```

#### 3. ตรวจสอบ RLS Policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'requests';
```

### วิธีแก้ไข: สร้าง Database Function แบบ SECURITY DEFINER

#### Step 1: สร้าง Function ใน Supabase
```sql
CREATE OR REPLACE FUNCTION public.approve_request(
  p_request_id uuid,
  p_tracking_number text,
  p_admin_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role text;
  updated_request record;
BEGIN
  -- ตรวจสอบว่าผู้ใช้เป็น fa_admin หรือไม่
  SELECT role INTO admin_role 
  FROM public.profiles 
  WHERE id = p_admin_id AND is_active = true;
  
  -- ถ้าไม่ใช่ fa_admin ให้ throw error
  IF admin_role != 'fa_admin' THEN
    RAISE EXCEPTION 'ไม่มีสิทธิ์ในการอนุมัติคำขอ';
  END IF;
  
  -- อัปเดตคำขอ
  UPDATE public.requests 
  SET 
    status = 'approved',
    tracking_number = p_tracking_number,
    approved_by = p_admin_id,
    updated_at = now()
  WHERE id = p_request_id
  RETURNING * INTO updated_request;
  
  -- ถ้าไม่มีข้อมูลถูกอัปเดต
  IF updated_request IS NULL THEN
    RAISE EXCEPTION 'ไม่พบคำขอที่ต้องการอนุมัติ';
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'อนุมัติคำขอเรียบร้อย',
    'data', row_to_json(updated_request)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
```

#### Step 2: แก้ไข Frontend Code
```typescript
const handleApprove = async (trackingNumber: string) => {
  if (!request || !user?.id) return;
  
  try {
    // ใช้ database function แทนการ update โดยตรง
    const { data: result, error } = await supabase
      .rpc('approve_request', {
        p_request_id: request.id,
        p_tracking_number: trackingNumber,
        p_admin_id: user.id
      });
    
    if (error) {
      console.error('Supabase error:', error);
      toast.error('ไม่สามารถอนุมัติคำขอได้: ' + error.message);
      return;
    }
    
    // Type cast for result
    const typedResult = result as { success: boolean; error?: string; message?: string };
    
    if (!typedResult.success) {
      toast.error('ไม่สามารถอนุมัติคำขอได้: ' + typedResult.error);
      return;
    }
    
    // Force re-fetch to ensure UI updates
    await fetchRequest();
    
    toast.success('อนุมัติคำขอเรียบร้อย');
  } catch (error) {
    console.error('Error:', error);
    toast.error('เกิดข้อผิดพลาดในการอนุมัติคำขอ');
  }
};
```

### ข้อดีของการใช้ SECURITY DEFINER Function
- **ผ่าน RLS Policy**: Function ทำงานด้วยสิทธิ์ของเจ้าของ function
- **ความปลอดภัย**: ยังคงตรวจสอบสิทธิ์ admin ในระดับ database
- **ทำงานได้แน่นอน**: ไม่มีปัญหาเรื่อง permission
- **ง่ายต่อการ maintain**: logic อยู่ใน database ทำให้ควบคุมได้ดี

### การป้องกันปัญหาในอนาคต

#### 1. ใช้ Database Functions สำหรับ Critical Operations
```sql
-- สร้าง functions สำหรับการดำเนินการสำคัญ
CREATE OR REPLACE FUNCTION public.reject_request(...)
CREATE OR REPLACE FUNCTION public.request_rework(...)
CREATE OR REPLACE FUNCTION public.confirm_delivery(...)
```

#### 2. ทดสอบ RLS Policies อย่างสม่ำเสมอ
```javascript
// Test script สำหรับทดสอบ CRUD operations
const testCRUDOperations = async () => {
  // Test as admin
  // Test as requester  
  // Test as receiver
};
```

#### 3. Error Handling ที่ดี
```typescript
// Pattern สำหรับ error handling
try {
  const { data, error } = await supabase.rpc('function_name', params);
  
  if (error) {
    console.error('Database error:', error);
    toast.error('ข้อผิดพลาด: ' + error.message);
    return;
  }
  
  const result = data as { success: boolean; error?: string };
  
  if (!result.success) {
    toast.error(result.error || 'การดำเนินการไม่สำเร็จ');
    return;
  }
  
  // Success handling
  toast.success('ดำเนินการสำเร็จ');
  await refetchData();
  
} catch (error) {
  console.error('Unexpected error:', error);
  toast.error('เกิดข้อผิดพลาดที่ไม่คาดคิด');
}
```

---

## Checklist สำหรับการแก้ปัญหา

- [ ] ตรวจสอบ console logs
- [ ] ยืนยันข้อมูลในฐานข้อมูล
- [ ] ทดสอบ RLS policies
- [ ] ตรวจสอบ user authentication state
- [ ] ยืนยัน component rendering logic
- [ ] ทดสอบกับ different user roles
- [ ] อัพเดท documentation

---

**วันที่อัพเดทล่าสุด**: 15 กรกฎาคม 2568
**ผู้อัพเดท**: System Documentation