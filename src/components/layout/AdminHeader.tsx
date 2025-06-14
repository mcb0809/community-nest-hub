
import React from 'react';
import { Bell, Search, Menu, Sun, Moon, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProfileDropdown from '@/components/admin/ProfileDropdown';

const AdminHeader = ({ 
  toggleSidebar, 
  darkMode, 
  toggleDarkMode 
}: { 
  toggleSidebar: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}) => {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-sm border-b border-red-500/20 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSidebar}
          className="lg:hidden text-white hover:bg-red-500/20"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Tìm kiếm users, courses, dữ liệu..." 
            className="pl-10 w-80 bg-slate-800/50 border-red-500/20 text-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* Center - Admin Status */}
      <div className="hidden lg:flex items-center space-x-2">
        <Shield className="w-5 h-5 text-red-400" />
        <span className="text-lg font-bold text-white">
          Admin Dashboard
        </span>
        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
          Super Admin
        </Badge>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={toggleDarkMode}
          className="text-slate-300 hover:bg-red-500/20 hover:text-white"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        
        <Button variant="ghost" size="sm" className="relative text-slate-300 hover:bg-red-500/20 hover:text-white">
          <AlertTriangle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-xs flex items-center justify-center text-white animate-pulse">
            2
          </span>
        </Button>
        
        <Button variant="ghost" size="sm" className="relative text-slate-300 hover:bg-red-500/20 hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-xs flex items-center justify-center text-white animate-pulse">
            7
          </span>
        </Button>
        
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default AdminHeader;
