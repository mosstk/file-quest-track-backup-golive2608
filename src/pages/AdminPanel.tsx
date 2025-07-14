import React, { useState, useEffect } from 'react';
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
import { Search, Plus, Trash, Edit, Loader2, AlertCircle } from 'lucide-react';
import { fetchAllUsers, createUser, updateUser, deleteUser } from '@/lib/utils/admin-users';

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<UserRole | 'all'>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    employeeId: '',
    company: '',
    department: '',
    division: '',
    role: 'requester' as 'fa_admin' | 'requester' | 'receiver',
  });

  // Load users from database
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      console.log('Loading users...');
      const data = await fetchAllUsers();
      console.log('Users loaded:', data);
      setUsers(data);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      setConnectionError('ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้');
      toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้งานได้');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on active tab and search term
  const filteredUsers = users.filter(user => {
    const matchesRole = activeTab === 'all' || user.role === activeTab;
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleAddUser = async () => {
    console.log('handleAddUser called with:', newUser);
    
    // Validate form
    if (!newUser.name || !newUser.username || !newUser.password || !newUser.employeeId) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, ชื่อผู้ใช้, รหัสผ่าน, รหัสพนักงาน)');
      return;
    }
    
    // Check if username or employeeId already exists
    const existingUser = users.find(u => 
      u.employeeId === newUser.employeeId || 
      (u as any).username === newUser.username
    );
    
    if (existingUser) {
      toast.error('รหัสพนักงานหรือชื่อผู้ใช้นี้มีอยู่แล้วในระบบ');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Starting user creation process...');
      
      await createUser({
        name: newUser.name,
        username: newUser.username,
        password: newUser.password,
        employeeId: newUser.employeeId,
        company: newUser.company || '',
        department: newUser.department || '',
        division: newUser.division || '',
        role: newUser.role,
      });
      
      console.log('User created successfully');
      
      // Reset form
      setNewUser({
        name: '',
        username: '',
        password: '',
        employeeId: '',
        company: '',
        department: '',
        division: '',
        role: 'requester',
      });
      
      setIsAddUserOpen(false);
      toast.success('เพิ่มผู้ใช้งานเรียบร้อย กรุณารอสักครู่เพื่อให้ข้อมูลอัพเดท');
      
      // Reload users after a delay
      setTimeout(() => {
        loadUsers();
      }, 2000);
      
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast.error(error.message || 'ไม่สามารถเพิ่มผู้ใช้งานได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    // Validate form
    if (!selectedUser.name || !selectedUser.employeeId) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateUser(selectedUser.id, {
        name: selectedUser.name,
        username: selectedUser.employeeId, // Use employeeId as username for existing users
        employeeId: selectedUser.employeeId,
        company: selectedUser.company,
        department: selectedUser.department,
        division: selectedUser.division,
        role: selectedUser.role,
        isActive: true, // Default to active
      });
      
      setSelectedUser(null);
      setIsEditUserOpen(false);
      toast.success('แก้ไขข้อมูลผู้ใช้งานเรียบร้อย');
      
      // Reload users
      await loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('ไม่สามารถแก้ไขข้อมูลผู้ใช้งานได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานนี้?')) {
      try {
        await deleteUser(userId);
        
        // Update local state immediately
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        
        toast.success('ลบผู้ใช้งานเรียบร้อย');
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error('ไม่สามารถลบผู้ใช้งานได้');
        // Reload users to ensure UI is in sync with database
        await loadUsers();
      }
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  console.log('Current users:', users);
  console.log('Filtered users:', filteredUsers);

  return (
    <Layout requireAuth allowedRoles={['fa_admin']}>
      <div className="container py-8 animate-fade-in">
        {connectionError && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span>{connectionError}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadUsers}
                  className="ml-auto"
                >
                  ลองใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">แผงควบคุมผู้ดูแลระบบ</h1>
            <p className="text-muted-foreground mt-1">
              จัดการผู้ใช้งานและสิทธิ์การเข้าถึง
            </p>
          </div>
          
          {/* Add User Dialog */}
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button disabled={!!connectionError}>
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
                    <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={newUser.name || ''} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">รหัสพนักงาน *</Label>
                    <Input 
                      id="employeeId" 
                      name="employeeId" 
                      value={newUser.employeeId || ''} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">อีเมลผู้ใช้งาน *</Label>
                    <Input 
                      id="username" 
                      name="username" 
                      type="email"
                      placeholder="example@company.com"
                      value={newUser.username || ''} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">รหัสผ่าน *</Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password"
                      value={newUser.password || ''} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">บริษัท</Label>
                  <Input 
                    id="company" 
                    name="company" 
                    value={newUser.company || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">ฝ่าย</Label>
                    <Input 
                      id="department" 
                      name="department" 
                      value={newUser.department || ''} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="division">แผนก</Label>
                    <Input 
                      id="division" 
                      name="division" 
                      value={newUser.division || ''} 
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
                      <SelectItem value="fa_admin">FA Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleAddUser} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  เพิ่มผู้ใช้งาน
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Edit User Dialog */}
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
                      value={selectedUser.email || 'ไม่ได้ระบุอีเมล'} 
                      onChange={handleInputChange}
                      disabled
                      className="bg-muted text-foreground"
                    />
                    <p className="text-xs text-muted-foreground">อีเมลไม่สามารถแก้ไขได้</p>
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
                        <SelectItem value="fa_admin">FA Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleEditUser} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  บันทึกการเปลี่ยนแปลง
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Users Table Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>จัดการผู้ใช้งาน</CardTitle>
            <CardDescription>
              เพิ่ม แก้ไข และลบผู้ใช้งานในระบบ ({users.length} คน)
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
                    ทั้งหมด ({users.length})
                  </Button>
                  <Button
                    variant={activeTab === 'requester' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('requester')}
                    className="min-w-[80px]"
                  >
                    Requester ({users.filter(u => u.role === 'requester').length})
                  </Button>
                  <Button
                    variant={activeTab === 'receiver' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('receiver')}
                    className="min-w-[80px]"
                  >
                    Receiver ({users.filter(u => u.role === 'receiver').length})
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary">
                    <TableRow>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>รหัสพนักงาน</TableHead>
                      <TableHead>บริษัท</TableHead>
                      <TableHead>ฝ่าย</TableHead>
                      <TableHead>แผนก</TableHead>
                      <TableHead>สิทธิ์</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.employeeId}</TableCell>
                          <TableCell>{user.company}</TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>{user.division}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'requester' 
                                ? 'bg-blue-100 text-blue-800' 
                                : user.role === 'receiver'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role === 'requester' ? 'Requester' : 
                               user.role === 'receiver' ? 'Receiver' : 'FA Admin'}
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
                          {users.length === 0 ? 'ไม่มีผู้ใช้งานในระบบ' : 'ไม่พบข้อมูลที่ค้นหา'}
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
