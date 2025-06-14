
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users, 
  BookOpen, 
  MessageCircle, 
  Calendar, 
  FileText, 
  Settings,
  Database,
  Shield,
  BarChart3,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: LayoutDashboard, 
    description: 'Tổng quan hệ thống' 
  },
  { 
    name: 'Quản lý Users', 
    href: '/admin/users', 
    icon: Users, 
    description: 'Quản lý người dùng' 
  },
  { 
    name: 'Quản lý Courses', 
    href: '/admin/course', 
    icon: BookOpen, 
    description: 'Quản lý khóa học' 
  },
  { 
    name: 'Chat & Messages', 
    href: '/admin/messages', 
    icon: MessageCircle, 
    description: 'Quản lý tin nhắn' 
  },
  { 
    name: 'Events', 
    href: '/admin/events', 
    icon: Calendar, 
    description: 'Quản lý sự kiện' 
  },
  { 
    name: 'Documents', 
    href: '/admin/documents', 
    icon: FileText, 
    description: 'Quản lý tài liệu' 
  },
  { 
    name: 'Database', 
    href: '/admin/database', 
    icon: Database, 
    description: 'Quản lý cơ sở dữ liệu' 
  },
  { 
    name: 'Analytics', 
    href: '/admin/analytics', 
    icon: BarChart3, 
    description: 'Thống kê & báo cáo' 
  },
  { 
    name: 'Settings', 
    href: '/admin/settings', 
    icon: Settings, 
    description: 'Cài đặt hệ thống' 
  },
];

const AdminSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-red-500/20 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-red-500/20 bg-gradient-to-r from-red-600/10 to-orange-600/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-500/30" 
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-red-400" : "text-slate-400 group-hover:text-white"
                )} />
                <div className="flex-1">
                  <span className="font-medium text-sm">{item.name}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin Info */}
        <div className="p-4 border-t border-red-500/20">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-red-500/20">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Administrator</p>
              <p className="text-xs text-red-300">Super Admin</p>
            </div>
            <Zap className="w-4 h-4 text-red-400" />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
