import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole, User } from '@/types';
import { toast } from 'sonner';
import { Search, Plus, Trash, Edit } from 'lucide-react';

const mockUsers: User[] = [
  {
    id: 'req-1',
    name: 'John Doe',
    email: 'john@example.com',
    employeeId: 'EMP001',
    company: 'Example Corp',
    department: 'Marketing',
    division: 'Digital Marketing',
    role: 'requester',
  },
  {
    id: 'req-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    employeeId: 'EMP002',
    company: 'Example Corp',
    department: 'Finance',
    division: 'Accounting',
    role: 'requester',
  },
  {
    id: 'req-3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    employeeId: 'EMP003',
    company: 'Example Corp',
    department: 'HR',
    division: 'Recruitment',
    role: 'requester',
  },
  {
    id: 'rec-1',
    name: 'Sarah Lee',
    email: 'sarah@example.com',
    employeeId: 'EMP004',
    company: 'Partner Corp',
    department: 'Operations',
    division: 'Supply Chain',
    role: 'receiver',
  },
  {
    id: 'rec-2',
    name: 'David Brown',
    email: 'david@example.com',
    employeeId: 'EMP005',
    company: 'Client Corp',
    department: 'Executive',
    division: 'Management',
    role: 'receiver',
  },
];

const AdminPanel = () => {
  console.log('Rendering AdminPanel page');
  
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<UserRole | 'all'>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    employeeId: '',
    company: '',
    department: '',
    division: '',
    role: 'requester',
  });

  const filteredUsers = users.filter(user => {
    const matchesRole = activeTab === 'all' || user.role === activeTab;
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesSearch;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isEditUserOpen && selectedUser) {
      setSelectedUser({
        ...selectedUser,
        [name]: value,
      });
    } else {
      setNewUser({
        ...newUser,
        [name]: value,
      });
    }
  };

  const handleRoleChange = (value: string) => {
    if (isEditUserOpen && selectedUser) {
      setSelectedUser({
        ...selectedUser,
        role: value as UserRole,
      });
    } else {
      setNewUser({
        ...newUser,
        role: value as UserRole,
      });
    }
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.employeeId) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    const user: User = {
      id: `user-${Date.now()}`,
      name: newUser.name || '',
      email: newUser.email || '',
      employeeId: newUser.employeeId || '',
      company: newUser.company || '',
      department: newUser.department || '',
      division: newUser.division || '',
      role: newUser.role as UserRole || 'requester',
    };
    
    setUsers([...users, user]);
    setNewUser({
      name: '',
      email: '',
      employeeId: '',
      company: '',
      department: '',
      division: '',
      role: 'requester',
    });
    
    setIsAddUserOpen(false);
    toast.success('เพิ่มผู้ใช้งานเรียบร้อย');
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    if (!selectedUser.name || !selectedUser.email || !selectedUser.employeeId) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id ? selectedUser : user
    );
    
    setUsers(updatedUsers);
    setSelectedUser(null);
    setIsEditUserOpen(false);
    toast.success('แก้ไขข้อมูลผู้ใช้งานเรียบร้อย');
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานนี้?')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      toast.success('ลบผู้ใช้งานเรียบร้อย');
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  return (
    <Layout requireAuth allowedRoles={['fa_admin']}>
      <div className="container py-8 animate-fade-in">
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-100 border-yellow-400 border p-2 mb-4 rounded text-sm">
            Debug mode: This page requires 'fa_admin' role
          </div>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">แผงควบคุมผู้ดูแลระบบ</h1>
            <p className="text-muted-foreground mt-1">
              จัดการผู้ใช้งานและสิทธิ์การเข้าถึง
            </p>
          </div>
          
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มผู้ใช้งาน
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>เพิ่มผู้ใช้งานใหม่</DialogTitle>
                <DialogDescription>
                  กรอกข้อมูลผู้ใช้งานและกำหนดสิทธิ์การเข้าถึง
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={newUser.name} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">รหัสพนักงาน</Label>
                    <Input 
                      id="employeeId" 
                      name="employeeId" 
                      value={newUser.employeeId} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={newUser.email} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">บริษัท</Label>
                  <Input 
                    id="company" 
                    name="company" 
                    value={newUser.company} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">ฝ่าย</Label>
                    <Input 
                      id="department" 
                      name="department" 
                      value={newUser.department} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="division">แผนก</Label>
                    <Input 
                      id="division" 
                      name="division" 
                      value={newUser.division} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">สิทธิ์การเข้าถึง</Label>
                  <Select value={newUser.role} onValueChange={handleRoleChange}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="เลือกสิทธิ์การเข้าถึง" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requester">Requester</SelectItem>
                      <SelectItem value="receiver">Receiver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleAddUser}>เพิ่มผู้ใช้งาน</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>แก้ไขข้อมูลผู้ใช้งาน</DialogTitle>
                <DialogDescription>
                  แก้ไขข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">ชื่อ-นามสกุล</Label>
                      <Input 
                        id="edit-name" 
                        name="name" 
                        value={selectedUser.name} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-employeeId">รหัสพนักงาน</Label>
                      <Input 
                        id="edit-employeeId" 
                        name="employeeId" 
                        value={selectedUser.employeeId} 
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">อีเมล</Label>
                    <Input 
                      id="edit-email" 
                      name="email" 
                      type="email" 
                      value={selectedUser.email} 
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-company">บริษัท</Label>
                    <Input 
                      id="edit-company" 
                      name="company" 
                      value={selectedUser.company} 
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-department">ฝ่าย</Label>
                      <Input 
                        id="edit-department" 
                        name="department" 
                        value={selectedUser.department} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-division">แผนก</Label>
                      <Input 
                        id="edit-division" 
                        name="division" 
                        value={selectedUser.division} 
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">สิทธิ์การเข้าถึง</Label>
                    <Select value={selectedUser.role} onValueChange={handleRoleChange}>
                      <SelectTrigger id="edit-role">
                        <SelectValue placeholder="เลือกสิทธิ์การเข้าถึง" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="requester">Requester</SelectItem>
                        <SelectItem value="receiver">Receiver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleEditUser}>บันทึกการเปลี่ยนแปลง</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>จัดการผู้ใช้งาน</CardTitle>
            <CardDescription>
              เพิ่ม แก้ไข และลบผู้ใช้งานในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="ค้นหาผู้ใช้งาน..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant={activeTab === 'all' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('all')}
                    className="min-w-[80px]"
                  >
                    ทั้งหมด
                  </Button>
                  <Button
                    variant={activeTab === 'requester' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('requester')}
                    className="min-w-[80px]"
                  >
                    Requester
                  </Button>
                  <Button
                    variant={activeTab === 'receiver' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('receiver')}
                    className="min-w-[80px]"
                  >
                    Receiver
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary">
                    <TableRow>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>อีเมล</TableHead>
                      <TableHead>รหัสพนักงาน</TableHead>
                      <TableHead>บริษัท</TableHead>
                      <TableHead>ฝ่าย</TableHead>
                      <TableHead>สิทธิ์</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.employeeId}</TableCell>
                          <TableCell>{user.company}</TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'requester' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {user.role === 'requester' ? 'Requester' : 'Receiver'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditDialog(user)}
                              className="h-8 w-8 mr-1"
                              title="แก้ไข"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteUser(user.id)}
                              className="h-8 w-8 text-destructive"
                              title="ลบ"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                          ไม่พบข้อมูล
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminPanel;
