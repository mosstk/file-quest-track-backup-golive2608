import React from 'react';

interface UserInfoDisplayProps {
  user: {
    name?: string;
    role: string;
    id: string;
    email?: string;
  };
}

const UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({ user }) => {
  return (
    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-800">
        ✅ เข้าสู่ระบบแล้ว: {user.name || 'ไม่ระบุชื่อ'} ({user.role})
      </p>
      <p className="text-xs text-green-600 mt-1">
        ID: {user.id} | อีเมล: {user.email || 'ไม่ระบุอีเมล'}
      </p>
      <p className="text-xs text-blue-600 mt-1">
        🎯 ใช้งาน User จริงในฐานข้อมูล Supabase
      </p>
    </div>
  );
};

export default UserInfoDisplay;