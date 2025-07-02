import React from 'react';

const SubmittingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>กำลังบันทึกข้อมูล...</span>
        </div>
      </div>
    </div>
  );
};

export default SubmittingOverlay;