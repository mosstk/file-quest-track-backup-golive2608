
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    try {
      setIsSigningIn(true);
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      // Error handling is already done in the signIn function
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPassword: string) => {
    try {
      setIsSigningIn(true);
      await signIn(userEmail, userPassword);
      navigate('/dashboard');
    } catch (error) {
      console.error('Quick login failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
          {/* TOA Large Logo */}
          <div className="text-center">
            <img
              src="https://www.toagroup.com/themes/default/assets/static/images/logo.svg"
              alt="TOA Logo"
              className="mx-auto w-28 h-auto mb-6"
            />
            
            <h1 className="text-4xl font-bold tracking-tighter mb-2">
              FileQuest<span className="text-primary">Track</span>
            </h1>
            
            <p className="text-muted-foreground">
              ระบบบริหารจัดการเอกสารที่ปลอดภัย ใช้งานง่าย และมีประสิทธิภาพ สำหรับ TOA
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>เข้าสู่ระบบ</CardTitle>
              <CardDescription>กรุณาเข้าสู่ระบบเพื่อใช้งาน</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@toagroup.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || isSigningIn}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || isSigningIn}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || isSigningIn}
                >
                  {isSigningIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
              </form>
              
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-3">สำหรับการทดสอบ:</p>
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickLogin('admin@toagroup.com', 'testpass123')}
                    disabled={loading || isSigningIn}
                  >
                    เข้าสู่ระบบในฐานะ Admin
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickLogin('requester@toagroup.com', 'testpass123')}
                    disabled={loading || isSigningIn}
                  >
                    เข้าสู่ระบบในฐานะ Requester
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickLogin('receiver@toagroup.com', 'testpass123')}
                    disabled={loading || isSigningIn}
                  >
                    เข้าสู่ระบบในฐานะ Receiver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
