# ระบบจัดการคำขอส่งเอกสาร (Document Request Management System)

## ภาพรวมระบบ

ระบบจัดการคำขอส่งเอกสารเป็นเว็บแอปพลิเคชันที่พัฒนาด้วย React + TypeScript + Supabase สำหรับจัดการการขอส่งเอกสารภายในองค์กร

### เทคโนโลยีที่ใช้
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Supabase (PostgreSQL, Authentication, RLS)
- **State Management**: React Context API
- **Routing**: React Router DOM
- **UI Components**: shadcn/ui
- **Build Tool**: Vite

## โครงสร้างระบบ

### 1. ระบบผู้ใช้งาน (User Management)
```
├── fa_admin (ผู้ดูแลระบบ)
├── requester (ผู้ขอเอกสาร)
└── receiver (ผู้รับเอกสาร)
```

### 2. โครงสร้างฐานข้อมูล

#### ตาราง `profiles`
```sql
- id (uuid, PK)
- username (text)
- full_name (text)
- email (text)
- employee_id (text)
- company (text)
- department (text)
- division (text)
- role (text) -- fa_admin, requester, receiver
- password (text)
- is_active (boolean)
- avatar_url (text)
- updated_at (timestamptz)
```

#### ตาราง `requests`
```sql
- id (uuid, PK)
- created_at (timestamptz)
- updated_at (timestamptz)
- requester_id (uuid, FK → profiles.id)
- document_name (text)
- receiver_email (text)
- receiver_name (text)
- receiver_company (text)
- receiver_department (text)
- receiver_phone (text)
- country_name (text)
- document_count (integer)
- file_path (text)
- status (enum) -- pending, approved, rejected, rework, completed
- tracking_number (text)
- admin_feedback (text)
- is_delivered (boolean)
- approved_by (uuid, FK → profiles.id)
- shipping_vendor (text)
```

#### ตาราง `user_paths`
```sql
- id (uuid, PK)
- user_id (uuid)
- path_name (text)
- path_value (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### 3. ฟังก์ชันฐานข้อมูลสำคัญ

#### `get_all_requests()`
```sql
-- ดึงข้อมูลคำขอทั้งหมดพร้อมข้อมูลผู้ขอ
RETURNS TABLE (
  id, created_at, updated_at, requester_id,
  document_name, receiver_email, receiver_name,
  receiver_company, receiver_department, receiver_phone,
  country_name, document_count, file_path, status,
  tracking_number, admin_feedback, is_delivered,
  approved_by, shipping_vendor,
  requester_name, requester_email, requester_employee_id,
  requester_company, requester_department, requester_division
)
```

#### `create_request()`
```sql
-- สร้างคำขอใหม่
CREATE OR REPLACE FUNCTION public.create_request(
  p_document_name text,
  p_receiver_email text,
  p_file_path text DEFAULT NULL,
  p_requester_id uuid DEFAULT NULL,
  p_document_count integer DEFAULT 1,
  p_receiver_name text DEFAULT NULL,
  p_receiver_department text DEFAULT NULL,
  p_country_name text DEFAULT NULL,
  p_receiver_company text DEFAULT NULL,
  p_receiver_phone text DEFAULT NULL,
  p_shipping_vendor text DEFAULT NULL
)
```

#### `approve_request()`
```sql
-- อนุมัติคำขอ (เวอร์ชันมี shipping_vendor)
CREATE OR REPLACE FUNCTION public.approve_request(
  p_request_id uuid,
  p_tracking_number text,
  p_admin_id uuid,
  p_shipping_vendor text
)
```

#### `confirm_delivery()`
```sql
-- ยืนยันการรับเอกสาร
CREATE OR REPLACE FUNCTION public.confirm_delivery(
  p_request_id uuid,
  p_receiver_id uuid
)
```

### 4. นโยบาย Row Level Security (RLS)

#### ตาราง `profiles`
- ทุกคนสามารถดูข้อมูล profiles ได้
- ผู้ใช้สามารถแก้ไขข้อมูลตัวเองได้
- fa_admin สามารถจัดการข้อมูลทุกคนได้

#### ตาราง `requests`
- ผู้ขอสามารถดูคำขอของตัวเองได้
- ผู้รับสามารถดูคำขอที่ส่งมาหาตัวเองได้
- fa_admin สามารถดูคำขอทั้งหมดได้
- ผู้ใช้สามารถแก้ไขคำขอที่ยังเป็น pending/rework ได้

#### ตาราง `user_paths`
- ผู้ใช้สามารถจัดการ paths ของตัวเองได้
- fa_admin สามารถจัดการ paths ทุกคนได้

## โครงสร้างไฟล์

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── ApprovalForm.tsx       # ฟอร์มอนุมัติคำขอ
│   ├── FileRequestForm.tsx    # ฟอร์มสร้างคำขอ
│   ├── Layout.tsx             # Layout หลัก
│   ├── Navbar.tsx             # Navigation bar
│   ├── RequestStatusBadge.tsx # Badge แสดงสถานะ
│   ├── RequestTable.tsx       # ตารางแสดงคำขอ
│   ├── TrackingDetails.tsx    # รายละเอียดการติดตาม
│   └── UserPathsManager.tsx   # จัดการ paths ผู้ใช้
├── context/
│   └── AuthContext.tsx        # Context สำหรับ Authentication
├── hooks/
│   ├── use-mobile.tsx         # Hook สำหรับ responsive
│   └── use-toast.ts           # Hook สำหรับ toast notifications
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client config
│       └── types.ts           # TypeScript types (auto-generated)
├── lib/
│   ├── utils.ts               # Utility functions
│   └── utils/
│       ├── admin-users.ts     # จัดการผู้ใช้ admin
│       ├── auth-helpers.ts    # ฟังก์ชันช่วย authentication
│       ├── formatters.ts      # ฟังก์ชันจัดรูปแบบข้อมูล
│       └── user-paths.ts      # จัดการ user paths
├── pages/
│   ├── AdminDashboard.tsx     # หน้า Dashboard สำหรับ admin
│   ├── AdminPanel.tsx         # หน้าจัดการผู้ใช้
│   ├── CreateEditRequest.tsx  # หน้าสร้าง/แก้ไขคำขอ
│   ├── Dashboard.tsx          # หน้า Dashboard หลัก
│   ├── DocumentationSystem.tsx # หน้าเอกสารระบบ
│   ├── Index.tsx              # หน้าแรก
│   ├── NotFound.tsx           # หน้า 404
│   ├── ReceiverDashboard.tsx  # หน้า Dashboard สำหรับผู้รับ
│   ├── ReportsPage.tsx        # หน้ารายงาน
│   ├── RequestDetail.tsx      # หน้ารายละเอียดคำขอ
│   ├── RequesterDashboard.tsx # หน้า Dashboard สำหรับผู้ขอ
│   ├── Requests.tsx           # หน้าแสดงรายการคำขอ
│   └── UserSystemPathsPage.tsx # หน้าจัดการ system paths
├── types/
│   ├── index.ts               # Types หลัก
│   ├── supabase.ts            # Supabase types (custom)
│   └── user-paths.ts          # Types สำหรับ user paths
└── main.tsx                   # Entry point
```

## การพัฒนาและการติดตั้ง

### Requirements
- Node.js 18+
- npm หรือ yarn
- Supabase Account

### การติดตั้ง
```bash
# Clone repository
git clone <repository-url>
cd document-request-system

# ติดตั้ง dependencies
npm install

# ตั้งค่า environment variables
cp .env.example .env.local
# แก้ไข VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY

# รันในโหมด development
npm run dev

# Build สำหรับ production
npm run build
```

### การตั้งค่า Supabase

1. สร้างโปรเจค Supabase ใหม่
2. รัน migrations ทั้งหมดในโฟลเดอร์ `supabase/migrations/`
3. ตั้งค่า Authentication (Email/Password)
4. ตั้งค่า RLS policies ตามที่ระบุในเอกสาร

## การใช้งานระบบ

### สำหรับผู้ขอเอกสาร (Requester)
1. เข้าสู่ระบบ
2. สร้างคำขอส่งเอกสารใหม่
3. ติดตามสถานะคำขอ
4. ดูประวัติคำขอ

### สำหรับผู้รับเอกสาร (Receiver)
1. เข้าสู่ระบบ
2. ดูคำขอที่ส่งมา
3. ยืนยันการรับเอกสาร

### สำหรับผู้ดูแลระบบ (FA Admin)
1. อนุมัติ/ปฏิเสธคำขอ
2. จัดการผู้ใช้งาน
3. ดูรายงานระบบ
4. จัดการ system paths

## ฟีเจอร์หลัก

- ✅ ระบบ Authentication และ Authorization
- ✅ การจัดการผู้ใช้ 3 ระดับ (Admin, Requester, Receiver)
- ✅ การสร้างและติดตามคำขอส่งเอกสาร
- ✅ ระบบอนุมัติ/ปฏิเสธคำขอ
- ✅ การยืนยันการรับเอกสาร
- ✅ รายงานและสถิติการใช้งาน
- ✅ ระบบจัดการ System Paths
- ✅ Responsive Design
- ✅ Dark/Light Mode Support
- ✅ Export ข้อมูลเป็น Excel

## ข้อมูลเพิ่มเติม

- ระบบใช้ Custom Authentication (ไม่ใช่ Supabase Auth)
- ข้อมูลผู้ใช้เก็บใน profiles table
- รองรับการส่งเอกสารไปต่างประเทศ
- ติดตามหมายเลขพัสดุ
- รองรับ Multiple shipping vendors