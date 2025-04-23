
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = (defaultRole: string) => {
    // Save intended role in localStorage to prefill the login form
    localStorage.setItem('intended_role', defaultRole);
    // Navigate to auth page
    navigate('/auth');
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
            File Request<span className="text-primary">Track</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ระบบบริหารจัดการเอกสารที่ปลอดภัย ใช้งานง่าย และมีประสิทธิภาพ สำหรับ TOA
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="relative group overflow-hidden bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-semibold mb-2">FA Admin</h3>
              <p className="text-muted-foreground text-sm">จัดการคำขอ อนุมัติเอกสาร และติดตามสถานะการจัดส่ง</p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleLogin('fa_admin')}
                >
                  เข้าสู่ระบบ
                </Button>
              </div>
            </div>
            
            <div className="relative group overflow-hidden bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-semibold mb-2">Requester</h3>
              <p className="text-muted-foreground text-sm">สร้างคำขอส่งไฟล์ ติดตามสถานะ และแก้ไขเอกสารตามคำขอ</p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleLogin('requester')}
                >
                  เข้าสู่ระบบ
                </Button>
              </div>
            </div>
            
            <div className="relative group overflow-hidden bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-semibold mb-2">Receiver</h3>
              <p className="text-muted-foreground text-sm">รับแจ้งเตือน ตรวจสอบเลขพัสดุ และยืนยันการได้รับเอกสาร</p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleLogin('receiver')}
                >
                  เข้าสู่ระบบ
                </Button>
              </div>
            </div>
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
