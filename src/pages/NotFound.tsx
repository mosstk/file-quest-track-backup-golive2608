
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-6">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <p className="text-2xl text-foreground mb-6">ไม่พบหน้าที่คุณกำลังค้นหา</p>
        <p className="text-muted-foreground mb-8">
          หน้าที่คุณพยายามเข้าถึงไม่มีอยู่หรืออาจถูกย้ายไปยังตำแหน่งอื่น
        </p>
        <Button asChild className="min-w-[150px]">
          <Link to="/">กลับสู่หน้าหลัก</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
