# Workflow Template - File Request Tracking System

## 📋 Development Workflow Template

### Phase 1: Analysis & Planning
```markdown
1. [ ] Requirements Analysis
   - [ ] Identify user roles and permissions
   - [ ] Define data models and relationships
   - [ ] Map user journeys and workflows
   - [ ] Define success criteria

2. [ ] Technical Planning
   - [ ] Choose tech stack (React + Supabase recommended)
   - [ ] Design database schema
   - [ ] Plan authentication strategy
   - [ ] Define API endpoints/functions
```

### Phase 2: Database Setup
```sql
-- Step 1: Create Enums
CREATE TYPE public.request_status AS ENUM (
  'pending', 'approved', 'rejected', 'rework', 'completed'
);

-- Step 2: Create Tables
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  username text,
  full_name text,
  avatar_url text,
  employee_id text,
  company text,
  department text,
  division text,
  role text NOT NULL,
  password varchar,
  is_active boolean DEFAULT true NOT NULL,
  email text
);

CREATE TABLE public.requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  requester_id uuid REFERENCES public.profiles(id) NOT NULL,
  document_name text NOT NULL,
  receiver_email text NOT NULL,
  file_path text,
  status public.request_status DEFAULT 'pending' NOT NULL,
  tracking_number text,
  admin_feedback text,
  is_delivered boolean DEFAULT false,
  approved_by uuid REFERENCES public.profiles(id)
);

-- Step 3: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Step 4: Create Helper Functions
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(auth.uid(), '11111111-1111-1111-1111-111111111111'::uuid);
$$;

CREATE OR REPLACE FUNCTION public.is_fa_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'fa_admin'
  );
$$;
```

### Phase 3: RLS Policies Template
```sql
-- Profiles Policies
CREATE POLICY "Public profiles viewable" ON public.profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins manage profiles" ON public.profiles 
  FOR ALL USING (public.is_fa_admin());

-- Requests Policies  
CREATE POLICY "Admins view all requests" ON public.requests 
  FOR SELECT USING (public.is_fa_admin());

CREATE POLICY "Users view own requests" ON public.requests 
  FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "Authenticated create requests" ON public.requests 
  FOR INSERT WITH CHECK (requester_id = public.get_current_user_id());

CREATE POLICY "Block anonymous access" ON public.requests 
  FOR ALL USING (auth.uid() IS NOT NULL);
```

### Phase 4: Frontend Architecture Template
```typescript
// 1. Types Definition
interface User {
  id: string;
  email: string;
  role: 'fa_admin' | 'requester' | 'receiver';
  full_name?: string;
  employee_id?: string;
  company?: string;
  department?: string;
  division?: string;
}

interface FileRequest {
  id: string;
  requester_id: string;
  document_name: string;
  receiver_email: string;
  file_path?: string;
  status: 'pending' | 'approved' | 'rejected' | 'rework' | 'completed';
  created_at: string;
  updated_at: string;
  tracking_number?: string;
  admin_feedback?: string;
  is_delivered: boolean;
  approved_by?: string;
  // Normalized fields
  requesterName?: string;
  requesterEmail?: string;
}

// 2. Auth Context Template
const AuthContext = createContext<{
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}>({} as any);

// 3. Layout Component Template
const Layout = ({ 
  children, 
  requireAuth = false, 
  allowedRoles = [] 
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}) => {
  const { user, loading } = useAuth();
  
  if (requireAuth && !user) return <LoginPage />;
  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <UnauthorizedPage />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};
```

### Phase 5: Component Templates

#### Data Table Template
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    render?: (value: any, item: T) => React.ReactNode;
  }>;
  searchFields?: (keyof T)[];
  actions?: (item: T) => React.ReactNode;
}

const DataTable = <T,>({ data, columns, searchFields, actions }: DataTableProps<T>) => {
  const [search, setSearch] = useState('');
  
  const filteredData = data.filter(item => 
    searchFields?.some(field => 
      String(item[field]).toLowerCase().includes(search.toLowerCase())
    )
  );
  
  return (
    <div className="space-y-4">
      <Input 
        placeholder="ค้นหา..." 
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead key={String(col.key)}>{col.label}</TableHead>
            ))}
            {actions && <TableHead>จัดการ</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item, idx) => (
            <TableRow key={idx}>
              {columns.map(col => (
                <TableCell key={String(col.key)}>
                  {col.render ? col.render(item[col.key], item) : String(item[col.key])}
                </TableCell>
              ))}
              {actions && <TableCell>{actions(item)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

#### Form Template
```typescript
interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select';
  required?: boolean;
  options?: { value: string; label: string; }[];
  validate?: (value: any) => string | undefined;
}

const DynamicForm = ({ 
  fields, 
  onSubmit, 
  initialData = {} 
}: {
  fields: FormFieldConfig[];
  onSubmit: (data: any) => void;
  initialData?: any;
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = formData[field.name];
      
      if (field.required && !value) {
        newErrors[field.name] = `${field.label} จำเป็นต้องกรอก`;
      }
      
      if (field.validate && value) {
        const error = field.validate(value);
        if (error) newErrors[field.name] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(field => (
        <div key={field.name}>
          <Label>{field.label}</Label>
          {field.type === 'textarea' ? (
            <Textarea 
              value={formData[field.name] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev, 
                [field.name]: e.target.value
              }))}
            />
          ) : field.type === 'select' ? (
            <Select 
              value={formData[field.name] || ''}
              onValueChange={(value) => setFormData(prev => ({
                ...prev, 
                [field.name]: value
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input 
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev, 
                [field.name]: e.target.value
              }))}
            />
          )}
          {errors[field.name] && (
            <p className="text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}
      <Button type="submit">บันทึก</Button>
    </form>
  );
};
```

### Phase 6: Database Functions Template
```sql
-- Create Item Function Template
CREATE OR REPLACE FUNCTION public.create_item(
  p_param1 TEXT,
  p_param2 TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_record public.table_name;
  actual_user_id UUID;
BEGIN
  actual_user_id := COALESCE(p_user_id, auth.uid(), 'default-uuid'::uuid);
  
  INSERT INTO public.table_name (col1, col2, user_id)
  VALUES (p_param1, p_param2, actual_user_id)
  RETURNING * INTO result_record;
  
  RETURN row_to_json(result_record);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Get All Items Function Template
CREATE OR REPLACE FUNCTION public.get_all_items()
RETURNS TABLE (
  id uuid,
  col1 text,
  col2 text,
  user_name text,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.col1,
    t.col2,
    p.full_name as user_name,
    p.email as user_email
  FROM public.table_name t
  LEFT JOIN public.profiles p ON t.user_id = p.id
  ORDER BY t.created_at DESC;
END;
$$;
```

### Phase 7: Error Handling Template
```typescript
// Error Handler Hook
const useErrorHandler = () => {
  const handleError = useCallback((error: any, context?: string) => {
    console.error(`Error ${context ? `in ${context}` : ''}:`, error);
    
    let message = 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
    
    if (error?.message?.includes('permission denied')) {
      message = 'ไม่มีสิทธิ์ในการดำเนินการนี้';
    } else if (error?.message?.includes('duplicate')) {
      message = 'ข้อมูลซ้ำ กรุณาตรวจสอบข้อมูลที่กรอก';
    } else if (error?.message) {
      message = error.message;
    }
    
    toast.error(message);
  }, []);
  
  return { handleError };
};

// API Call Wrapper
const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();
  
  const callApi = useCallback(async (apiFunction: () => Promise<any>) => {
    try {
      setLoading(true);
      const result = await apiFunction();
      return result;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);
  
  return { callApi, loading };
};
```

### Phase 8: Testing Template
```typescript
// Mock Data Template
export const mockUsers = {
  admin: {
    id: '11111111-1111-1111-1111-111111111111',
    username: 'admin',
    password: 'admin',
    role: 'fa_admin',
    full_name: 'System Admin'
  },
  requester: {
    id: '22222222-2222-2222-2222-222222222222',
    username: 'requester',
    password: 'requester',
    role: 'requester',
    full_name: 'Test Requester'
  },
  receiver: {
    id: '33333333-3333-3333-3333-333333333333',
    username: 'receiver',
    password: 'receiver',
    role: 'receiver',
    full_name: 'Test Receiver'
  }
};

// Test Scenarios Template
const testScenarios = [
  {
    name: 'Admin Login',
    steps: [
      'เข้าหน้า login',
      'กรอก username: admin, password: admin',
      'กดปุ่ม เข้าสู่ระบบ',
      'ตรวจสอบว่าเข้าสู่หน้า Admin Dashboard'
    ]
  },
  {
    name: 'Create Request',
    steps: [
      'Login เป็น requester',
      'กดปุ่ม สร้างคำขอใหม่',
      'กรอกข้อมูลครบถ้วน',
      'กดปุ่ม สร้างคำขอ',
      'ตรวจสอบว่าคำขอถูกสร้างเรียบร้อย'
    ]
  }
];
```

### Phase 9: Deployment Checklist
```markdown
## Pre-deployment
- [ ] Database migrations completed
- [ ] RLS policies tested
- [ ] Mock data inserted
- [ ] All functions deployed
- [ ] Environment variables set
- [ ] CORS policies configured

## Post-deployment
- [ ] Authentication flow tested
- [ ] All user roles tested
- [ ] CRUD operations verified
- [ ] Error handling verified
- [ ] Performance tested
- [ ] Security audit completed

## Production Monitoring
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Database backup verified
- [ ] Rollback plan prepared
```

---

## 🔄 Common Issues & Solutions Template

### Authentication Issues
```
Problem: User can't login
Solutions:
1. Check RLS policies
2. Verify mock user data
3. Check session creation
4. Test with direct SQL
```

### RLS Policy Violations
```
Problem: "permission denied" errors
Solutions:
1. Create SECURITY DEFINER functions
2. Use fallback user IDs
3. Bypass RLS with functions
4. Test policies independently
```

### Data Not Showing
```
Problem: Empty tables/lists
Solutions:
1. Check RLS policies for SELECT
2. Verify JOIN conditions
3. Use RPC functions instead
4. Test queries directly
```

---

**Template Version**: 1.0  
**Created**: 2025-07-14  
**Usage**: Copy sections as needed for new projects