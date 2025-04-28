
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const intendedRole = localStorage.getItem('intended_role') || 'requester';

  console.log('Auth component loaded, intended role:', intendedRole);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
      localStorage.removeItem('intended_role'); // Clean up
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        console.log('Attempting login with:', email, password);
        await signIn(email, password);
        toast.success('เข้าสู่ระบบสำเร็จ');
      } else {
        console.log('Attempting signup with role:', intendedRole);
        // For signup, structure userData correctly
        await signUp(email, password, {
          full_name: name,
          role: intendedRole, // Use the intended role from localStorage
        });
        toast.success('ลงทะเบียนสำเร็จ');
      }
      navigate('/dashboard');
      localStorage.removeItem('intended_role'); // Clean up
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}</CardTitle>
          <CardDescription>
            {isLogin
              ? 'เข้าสู่ระบบเพื่อใช้งาน FileQuestTrack'
              : 'สร้างบัญชีใหม่เพื่อเริ่มใช้งาน FileQuestTrack'}
          </CardDescription>
          {intendedRole && (
            <div className="mt-2 text-sm text-primary">
              กำลังลงทะเบียนในบทบาท: {intendedRole === 'fa_admin' ? 'FA Admin' : 
                                     intendedRole === 'requester' ? 'Requester' : 
                                     intendedRole === 'receiver' ? 'Receiver' : intendedRole}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="ชื่อ นามสกุล"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full">
              {isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'ลงทะเบียนบัญชีใหม่' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
