
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Index = () => {
  const { user, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'fa_admin':
          navigate('/dashboard'); // Will redirect to AdminDashboard
          break;
        case 'requester':
          navigate('/dashboard'); // Will redirect to RequesterDashboard
          break;
        case 'receiver':
          navigate('/dashboard'); // Will redirect to ReceiverDashboard
          break;
        default:
          navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn(username.trim(), password);
    } catch (error) {
      // Error handling is already done in the signIn function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (testUsername: string, testPassword: string) => {
    try {
      setIsSubmitting(true);
      setUsername(testUsername);
      setPassword(testPassword);
      await signIn(testUsername, testPassword);
    } catch (error) {
      // Error handling is already done in the signIn function
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
          {/* TOA Large Logo */}
          <img
            src="https://www.toagroup.com/themes/default/assets/static/images/logo.svg"
            alt="TOA Logo"
            className="mx-auto w-28 h-auto mb-6"
          />
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
            FileQuest<span className="text-primary">Track</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ระบบบริหารจัดการเอกสารที่ปลอดภัย ใช้งานง่าย และมีประสิทธิภาพ สำหรับ TOA
          </p>
          
          <div className="flex justify-center mt-12">
            {/* Login Form */}
            <Card className="bg-white/50 backdrop-blur-sm shadow-lg max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-center">เข้าสู่ระบบ</CardTitle>
                <CardDescription className="text-center">
                  กรุณาใส่ชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">ชื่อผู้ใช้</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="กรอกชื่อผู้ใช้"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่าน"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <footer className="bg-muted/30 py-8 px-6 border-t">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TOA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
