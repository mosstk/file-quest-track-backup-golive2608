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

**วันที่อัพเดทล่าสุด**: 15 กรกฎาคม 2568
**ผู้อัพเดท**: System Documentation