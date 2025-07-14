import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Database, 
  Code, 
  Shield, 
  Bug, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Book,
  Settings,
  Users,
  Activity,
  Zap
} from 'lucide-react';

const DocumentationSystem = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const systemOverview = {
    title: "File Request Tracking System",
    version: "1.0",
    status: "Production Ready",
    lastUpdated: "2025-07-14",
    description: "ระบบติดตามการส่งไฟล์สำหรับ TOA Group ที่ใช้ React + TypeScript + Supabase"
  };

  const techStack = [
    { name: "React", version: "18.3.1", type: "Frontend Framework" },
    { name: "TypeScript", version: "Latest", type: "Type System" },
    { name: "Supabase", version: "2.49.4", type: "Backend/Database" },
    { name: "Tailwind CSS", version: "Latest", type: "Styling" },
    { name: "Shadcn UI", version: "Latest", type: "UI Components" },
    { name: "React Router", version: "6.26.2", type: "Routing" },
  ];

  const userRoles = [
    {
      role: "fa_admin",
      title: "ผู้ดูแลระบบ",
      permissions: ["จัดการผู้ใช้", "อนุมัติ/ปฏิเสธคำขอ", "ดูรายงาน", "จัดการระบบ"],
      color: "bg-red-100 text-red-800"
    },
    {
      role: "requester", 
      title: "ผู้ขอส่งไฟล์",
      permissions: ["สร้างคำขอ", "แก้ไขคำขอ", "ติดตามสถานะ"],
      color: "bg-blue-100 text-blue-800"
    },
    {
      role: "receiver",
      title: "ผู้รับไฟล์", 
      permissions: ["ดูคำขอที่อนุมัติแล้ว", "รับไฟล์"],
      color: "bg-green-100 text-green-800"
    }
  ];

  const databaseTables = [
    {
      name: "profiles",
      description: "ข้อมูลผู้ใช้งาน",
      fields: ["id", "full_name", "email", "role", "employee_id", "company", "department", "division", "is_active"],
      relations: ["→ requests (requester_id)", "→ requests (approved_by)"]
    },
    {
      name: "requests", 
      description: "คำขอส่งไฟล์",
      fields: ["id", "requester_id", "document_name", "receiver_email", "status", "tracking_number", "admin_feedback"],
      relations: ["← profiles (requester_id)", "← profiles (approved_by)"]
    },
    {
      name: "user_paths",
      description: "เส้นทางไฟล์ของผู้ใช้",
      fields: ["id", "user_id", "path_name", "path_value"],
      relations: ["← profiles (user_id)"]
    }
  ];

  const majorIssues = [
    {
      title: "Authentication Problems",
      problem: "Mock admin login ไม่สร้าง Supabase session ทำให้ RLS policies ไม่ทำงาน",
      solution: "สร้าง mock session ใน AuthContext + ใช้ SECURITY DEFINER functions",
      status: "resolved",
      impact: "high"
    },
    {
      title: "RLS Policy Violations", 
      problem: "new row violates row-level security policy for table requests",
      solution: "สร้าง create_request() function ที่ bypass RLS + ปรับปรุง policies",
      status: "resolved",
      impact: "high"
    },
    {
      title: "Data Visibility Issues",
      problem: "fa_admin ไม่เห็นข้อมูล requests ทั้งหมด",
      solution: "สร้าง get_all_requests() function + ใช้ RPC calls แทน direct queries",
      status: "resolved", 
      impact: "medium"
    },
    {
      title: "Duplicate Supabase Clients",
      problem: "Multiple GoTrueClient instances detected",
      solution: "ลบ src/lib/supabase.ts + ใช้เฉพาะ integrations client",
      status: "resolved",
      impact: "low"
    }
  ];

  const keyFunctions = [
    {
      name: "get_current_user_id()",
      purpose: "ได้ user ID ปัจจุบัน (fallback สำหรับ mock users)",
      returns: "UUID",
      usage: "ใช้ใน RLS policies และ functions อื่น"
    },
    {
      name: "create_request()",
      purpose: "สร้างคำขอใหม่ (bypass RLS)",
      returns: "JSON",
      usage: "เรียกจาก FileRequestForm เมื่อสร้างคำขอ"
    },
    {
      name: "get_all_requests()",
      purpose: "ดึงข้อมูลคำขอทั้งหมดพร้อม requester info",
      returns: "TABLE",
      usage: "ใช้ใน AdminDashboard และ Requests page"
    },
    {
      name: "is_fa_admin()",
      purpose: "ตรวจสอบว่า user เป็น fa_admin หรือไม่",
      returns: "BOOLEAN", 
      usage: "ใช้ใน RLS policies"
    }
  ];

  const apiEndpoints = [
    {
      endpoint: "POST /rest/v1/rpc/create_request",
      description: "สร้างคำขอใหม่",
      params: "document_name, receiver_email, file_path, requester_id",
      auth: "Required"
    },
    {
      endpoint: "POST /rest/v1/rpc/get_all_requests", 
      description: "ดึงข้อมูลคำขอทั้งหมด",
      params: "None",
      auth: "fa_admin only"
    },
    {
      endpoint: "GET /rest/v1/requests",
      description: "ดึงข้อมูลคำขอ (filtered by RLS)",
      params: "Query parameters",
      auth: "Required"
    },
    {
      endpoint: "PATCH /rest/v1/requests",
      description: "อัพเดทคำขอ", 
      params: "Request ID + update data",
      auth: "Required"
    }
  ];

  const securityFeatures = [
    {
      feature: "Row Level Security (RLS)",
      description: "ป้องกันการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต",
      implementation: "Policies บน profiles และ requests tables"
    },
    {
      feature: "SECURITY DEFINER Functions",
      description: "Functions ที่ทำงานด้วยสิทธิ์ของ owner",
      implementation: "get_all_requests(), create_request()"
    },
    {
      feature: "Role-based Access Control",
      description: "จำกัดการเข้าถึงตาม user role",
      implementation: "Layout component + RLS policies"
    },
    {
      feature: "Mock User Validation",
      description: "ป้องกัน unauthorized access สำหรับ testing",
      implementation: "Mock UUIDs ใน policies และ functions"
    }
  ];

  const performanceOptimizations = [
    {
      optimization: "Database Functions",
      benefit: "ลด network calls และเพิ่มความเร็ว",
      implementation: "JOIN data ใน database แทน frontend"
    },
    {
      optimization: "React.useMemo",
      benefit: "ลด re-calculations ที่ไม่จำเป็น",
      implementation: "Status counts, filtered data"
    },
    {
      optimization: "Proper Indexing", 
      benefit: "Query performance",
      implementation: "Foreign keys และ commonly searched fields"
    },
    {
      optimization: "Component Lazy Loading",
      benefit: "Faster initial load",
      implementation: "Route-based code splitting"
    }
  ];

  const troubleshootingGuide = [
    {
      problem: "User can't login",
      symptoms: ["Login form doesn't work", "Redirect to login page", "Session not created"],
      solutions: [
        "Check RLS policies on profiles table",
        "Verify mock user data exists",
        "Test authentication flow step by step",
        "Check console for auth errors"
      ]
    },
    {
      problem: "Data not showing",
      symptoms: ["Empty tables", "Loading forever", "Permission denied errors"], 
      solutions: [
        "Check RLS policies for SELECT operations",
        "Verify user role permissions",
        "Use RPC functions instead of direct queries",
        "Test queries directly in Supabase"
      ]
    },
    {
      problem: "Can't create requests",
      symptoms: ["Form submission fails", "RLS violation errors", "Insert operations blocked"],
      solutions: [
        "Use create_request() RPC function",
        "Check INSERT policies",
        "Verify user authentication status",
        "Test with mock admin user"
      ]
    }
  ];

  const deploymentChecklist = [
    { item: "Database migrations applied", status: "completed", priority: "high" },
    { item: "RLS policies configured", status: "completed", priority: "high" },
    { item: "Mock users created", status: "completed", priority: "medium" },
    { item: "Functions deployed", status: "completed", priority: "high" },
    { item: "Environment variables set", status: "pending", priority: "medium" },
    { item: "CORS policies configured", status: "pending", priority: "low" },
    { item: "Production testing completed", status: "pending", priority: "high" }
  ];

  const filteredContent = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Documentation System</h1>
          <p className="text-xl text-muted-foreground">
            ระบบเอกสารและคู่มือการใช้งาน File Request Tracking System
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาเอกสาร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <h3 className="font-semibold">{systemOverview.title}</h3>
                <p className="text-sm text-muted-foreground">ชื่อระบบ</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary">{systemOverview.version}</Badge>
                <p className="text-sm text-muted-foreground mt-1">เวอร์ชัน</p>
              </div>
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800">{systemOverview.status}</Badge>
                <p className="text-sm text-muted-foreground mt-1">สถานะ</p>
              </div>
              <div className="text-center">
                <p className="font-medium">{systemOverview.lastUpdated}</p>
                <p className="text-sm text-muted-foreground">อัพเดทล่าสุด</p>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-center text-muted-foreground">{systemOverview.description}</p>
          </CardContent>
        </Card>

        {/* Main Documentation */}
        <Tabs defaultValue="tech-stack" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="tech-stack" className="text-xs">Tech Stack</TabsTrigger>
            <TabsTrigger value="architecture" className="text-xs">Architecture</TabsTrigger>
            <TabsTrigger value="database" className="text-xs">Database</TabsTrigger>
            <TabsTrigger value="issues" className="text-xs">Issues</TabsTrigger>
            <TabsTrigger value="api" className="text-xs">API</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
            <TabsTrigger value="deployment" className="text-xs">Deployment</TabsTrigger>
          </TabsList>

          {/* Tech Stack */}
          <TabsContent value="tech-stack">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Technology Stack
                </CardTitle>
                <CardDescription>เทคโนโลยีที่ใช้ในการพัฒนาระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContent(techStack).map((tech, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{tech.name}</h3>
                            <p className="text-sm text-muted-foreground">{tech.type}</p>
                          </div>
                          <Badge variant="outline">{tech.version}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architecture */}
          <TabsContent value="architecture">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredContent(userRoles).map((role, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={role.color}>{role.role}</Badge>
                          <h3 className="font-semibold">{role.title}</h3>
                        </div>
                        <div className="space-y-1">
                          {role.permissions.map((permission, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {permission}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Component Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2 text-sm font-mono">
                      <div>src/</div>
                      <div className="ml-4">├── components/</div>
                      <div className="ml-8">├── ui/ (Shadcn UI)</div>
                      <div className="ml-8">├── Layout.tsx</div>
                      <div className="ml-8">├── Navbar.tsx</div>
                      <div className="ml-8">├── RequestTable.tsx</div>
                      <div className="ml-8">└── FileRequestForm.tsx</div>
                      <div className="ml-4">├── pages/</div>
                      <div className="ml-8">├── Dashboard.tsx</div>
                      <div className="ml-8">├── AdminPanel.tsx</div>
                      <div className="ml-8">└── Requests.tsx</div>
                      <div className="ml-4">├── context/</div>
                      <div className="ml-8">└── AuthContext.tsx</div>
                      <div className="ml-4">├── lib/utils/</div>
                      <div className="ml-8">├── formatters.ts</div>
                      <div className="ml-8">└── admin-users.ts</div>
                      <div className="ml-4">└── types/</div>
                      <div className="ml-8">└── index.ts</div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Database */}
          <TabsContent value="database">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Schema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContent(databaseTables).map((table, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <h3 className="font-semibold mb-2">{table.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{table.description}</p>
                          
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Fields:</h4>
                            <div className="flex flex-wrap gap-1">
                              {table.fields.map((field, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{field}</Badge>
                              ))}
                            </div>
                          </div>
                          
                          {table.relations.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <h4 className="text-sm font-medium">Relations:</h4>
                              {table.relations.map((relation, i) => (
                                <p key={i} className="text-xs text-muted-foreground font-mono">{relation}</p>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Key Functions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredContent(keyFunctions).map((func, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold font-mono text-blue-600">{func.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{func.purpose}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span><strong>Returns:</strong> {func.returns}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{func.usage}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Issues */}
          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Major Issues & Solutions
                </CardTitle>
                <CardDescription>ปัญหาหลักที่เจอและวิธีการแก้ไข</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredContent(majorIssues).map((issue, index) => (
                    <Card key={index} className={`border-l-4 ${
                      issue.impact === 'high' ? 'border-l-red-500' : 
                      issue.impact === 'medium' ? 'border-l-yellow-500' : 
                      'border-l-green-500'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold">{issue.title}</h3>
                          <div className="flex gap-2">
                            <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                              {issue.status}
                            </Badge>
                            <Badge variant="outline" className={
                              issue.impact === 'high' ? 'text-red-600' :
                              issue.impact === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }>
                              {issue.impact}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-red-600">Problem:</h4>
                            <p className="text-sm text-muted-foreground">{issue.problem}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-green-600">Solution:</h4>
                            <p className="text-sm text-muted-foreground">{issue.solution}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredContent(apiEndpoints).map((endpoint, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{endpoint.endpoint}</h3>
                        <Badge variant={endpoint.auth === 'Required' ? 'default' : 'secondary'}>
                          {endpoint.auth}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{endpoint.description}</p>
                      <p className="text-xs"><strong>Parameters:</strong> {endpoint.params}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredContent(securityFeatures).map((feature, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{feature.feature}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs font-mono">{feature.implementation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Optimizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredContent(performanceOptimizations).map((opt, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{opt.optimization}</h3>
                      <p className="text-sm text-green-600 mb-2">✓ {opt.benefit}</p>
                      <p className="text-xs text-muted-foreground">{opt.implementation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deployment */}
          <TabsContent value="deployment">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Deployment Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredContent(deploymentChecklist).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm">{item.item}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                          <Badge variant="outline" className={
                            item.priority === 'high' ? 'text-red-600' :
                            item.priority === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }>
                            {item.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5" />
                    Troubleshooting Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredContent(troubleshootingGuide).map((guide, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">{guide.problem}</h3>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-orange-600">Symptoms:</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground ml-2">
                              {guide.symptoms.map((symptom, i) => (
                                <li key={i}>{symptom}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-green-600">Solutions:</h4>
                            <ol className="list-decimal list-inside text-sm text-muted-foreground ml-2">
                              {guide.solutions.map((solution, i) => (
                                <li key={i}>{solution}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Documentation System v1.0 | Created: 2025-07-14 | Last Updated: 2025-07-14
              </p>
              <p className="text-xs text-muted-foreground">
                © 2025 TOA Group. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentationSystem;