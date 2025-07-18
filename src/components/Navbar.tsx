
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, FileText, LayoutDashboard, UserCog, FolderTree, X, Menu, Book, BarChart3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const NavbarMenuItems = ({ onClose }: { onClose?: () => void }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) => 
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive(path) 
      ? 'bg-primary text-primary-foreground font-medium' 
      : 'hover:bg-accent hover:text-accent-foreground'
    }`;

  const handleClick = () => {
    if (onClose) onClose();
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-1">
      <Link to="/dashboard" className={linkClass('/dashboard')} onClick={handleClick}>
        <LayoutDashboard size={18} />
        <span>หน้าหลัก</span>
      </Link>
      
      <Link to="/requests" className={linkClass('/requests')} onClick={handleClick}>
        <FileText size={18} />
        <span>คำขอส่งไฟล์</span>
      </Link>

      {(user.role === 'fa_admin' || user.role === 'requester') && (
        <Link to="/system-paths" className={linkClass('/system-paths')} onClick={handleClick}>
          <FolderTree size={18} />
          <span>จัดการ System Path</span>
        </Link>
      )}
      
      {user.role === 'fa_admin' && (
        <>
          <Link to="/admin" className={linkClass('/admin')} onClick={handleClick}>
            <UserCog size={18} />
            <span>จัดการระบบ</span>
          </Link>
          
          <Link to="/reports" className={linkClass('/reports')} onClick={handleClick}>
            <BarChart3 size={18} />
            <span>รายงาน</span>
          </Link>
        </>
      )}
    </div>
  );
};

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const routes = [
    { path: '/dashboard', label: 'Dashboard', roles: ['fa_admin', 'requester', 'receiver'] },
    { path: '/requests', label: 'File Requests', roles: ['fa_admin', 'requester'] },
    { path: '/admin', label: 'Admin Panel', roles: ['fa_admin'] },
    { path: '/reports', label: 'Report', roles: ['fa_admin'] },
  ];

  const filteredRoutes = routes.filter(route => 
    !user || route.roles.includes(user.role)
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b shadow-sm">
      <div className="container py-3 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="https://www.toagroup.com/themes/default/assets/static/images/logo.svg"
                alt="TOA Logo"
                className="h-10 w-auto mr-3"
                style={{ minWidth: 40 }}
              />
              <span className="text-xl font-semibold text-primary">
                Document <span className="text-muted-foreground">Tracking</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user && (
              <div className="flex items-center space-x-6">
                {filteredRoutes.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className={`relative transition-colors px-1 py-2 text-sm font-medium ${
                      location.pathname === route.path
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {route.label}
                    {location.pathname === route.path && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-sm cursor-pointer" onClick={signOut}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/">Login</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="h-9 w-9"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && user && (
          <div className="md:hidden mt-3 pb-3 space-y-2 animate-slide-up">
            {filteredRoutes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={`block py-2 px-3 rounded-md ${
                  location.pathname === route.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
