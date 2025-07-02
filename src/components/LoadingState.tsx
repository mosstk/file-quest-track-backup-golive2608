import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "กำลังโหลดข้อมูล..." 
}) => {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-pulse text-primary">{message}</div>
    </div>
  );
};

export default LoadingState;