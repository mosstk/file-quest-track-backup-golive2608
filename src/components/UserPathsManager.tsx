
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, X, Edit, Save } from 'lucide-react';
import { toast } from 'sonner';
import { UserPath } from '@/types/user-paths';
import { getUserPaths, createUserPath, updateUserPath, deleteUserPath } from '@/lib/utils/user-paths';

const UserPathsManager = () => {
  const [paths, setPaths] = useState<UserPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPathName, setNewPathName] = useState('');
  const [newPathValue, setNewPathValue] = useState('');
  const [editPath, setEditPath] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchPaths = async () => {
    try {
      setLoading(true);
      const data = await getUserPaths();
      setPaths(data);
    } catch (error) {
      console.error('Error fetching paths:', error);
      toast.error('ไม่สามารถโหลดข้อมูล Path ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  const handleAddPath = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPathName || !newPathValue) {
      toast.error('กรุณากรอกชื่อและค่าของ Path');
      return;
    }

    try {
      await createUserPath({
        path_name: newPathName,
        path_value: newPathValue
      });
      setNewPathName('');
      setNewPathValue('');
      toast.success('เพิ่ม Path เรียบร้อยแล้ว');
      fetchPaths();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Path นี้มีอยู่แล้วในระบบ');
      } else {
        toast.error('ไม่สามารถเพิ่ม Path ได้');
      }
    }
  };

  const handleStartEdit = (path: UserPath) => {
    setEditPath(path.id);
    setEditValue(path.path_value);
  };

  const handleSaveEdit = async (path: UserPath) => {
    try {
      await updateUserPath(path.id, {
        path_value: editValue
      });
      setEditPath(null);
      toast.success('อัพเดท Path เรียบร้อยแล้ว');
      fetchPaths();
    } catch (error) {
      toast.error('ไม่สามารถอัพเดท Path ได้');
    }
  };

  const handleCancelEdit = () => {
    setEditPath(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณต้องการลบ Path นี้ใช่หรือไม่?')) {
      try {
        await deleteUserPath(id);
        toast.success('ลบ Path เรียบร้อยแล้ว');
        fetchPaths();
      } catch (error) {
        toast.error('ไม่สามารถลบ Path ได้');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">จัดการ System Path</CardTitle>
        <CardDescription>
          เพิ่ม แก้ไข หรือลบเส้นทางการเก็บไฟล์ของระบบ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddPath} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="path-name">ชื่อ Path</Label>
              <Input 
                id="path-name"
                value={newPathName}
                onChange={(e) => setNewPathName(e.target.value)}
                placeholder="ระบุชื่อ Path"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="path-value">ค่า Path</Label>
              <div className="flex space-x-2">
                <Input 
                  id="path-value"
                  value={newPathValue}
                  onChange={(e) => setNewPathValue(e.target.value)}
                  placeholder="ระบุเส้นทางในระบบ เช่น /documents/finance"
                  className="flex-1"
                />
                <Button type="submit" className="flex items-center space-x-1">
                  <PlusCircle size={16} />
                  <span>เพิ่ม</span>
                </Button>
              </div>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-primary">กำลังโหลดข้อมูล...</div>
          </div>
        ) : paths.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ Path</TableHead>
                <TableHead>ค่า Path</TableHead>
                <TableHead className="w-[150px] text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paths.map((path) => (
                <TableRow key={path.id}>
                  <TableCell className="font-medium">{path.path_name}</TableCell>
                  <TableCell>
                    {editPath === path.id ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      path.path_value
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editPath === path.id ? (
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelEdit()}
                        >
                          <X size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSaveEdit(path)}
                        >
                          <Save size={16} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(path)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(path.id)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            ยังไม่มี Path ในระบบ กรุณาเพิ่มเส้นทางใหม่
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPathsManager;
