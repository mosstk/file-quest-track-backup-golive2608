
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

const Index = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleRoleSelection = (role: UserRole) => {
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
            FileQuest<span className="text-primary">Track</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ระบบบริหารจัดการเอกสารที่ปลอดภัย ใช้งานง่าย และมีประสิทธิภาพ สำหรับองค์กรทุกขนาด
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div 
              className="relative group overflow-hidden bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => handleRoleSelection('fa_admin')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-semibold mb-2">FA Admin</h3>
              <p className="text-muted-foreground text-sm">จัดการคำขอ อนุมัติเอกสาร และติดตามสถานะการจัดส่ง</p>
              <div className="mt-4">
                <Button variant="outline" className="w-full">เข้าสู่ระบบ</Button>
              </div>
            </div>
            
            <div 
              className="relative group overflow-hidden bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => handleRoleSelection('requester')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-semibold mb-2">Requester</h3>
              <p className="text-muted-foreground text-sm">สร้างคำขอส่งไฟล์ ติดตามสถานะ และแก้ไขเอกสารตามคำขอ</p>
              <div className="mt-4">
                <Button variant="outline" className="w-full">เข้าสู่ระบบ</Button>
              </div>
            </div>
            
            <div 
              className="relative group overflow-hidden bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => handleRoleSelection('receiver')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-semibold mb-2">Receiver</h3>
              <p className="text-muted-foreground text-sm">รับแจ้งเตือน ตรวจสอบเลขพัสดุ และยืนยันการได้รับเอกสาร</p>
              <div className="mt-4">
                <Button variant="outline" className="w-full">เข้าสู่ระบบ</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-muted/30 py-8 px-6 border-t">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FileQuest Track. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
