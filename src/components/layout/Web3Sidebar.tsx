
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  BookOpen, 
  MessageCircle, 
  Calendar, 
  FileText, 
  Trophy,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home, label: 'Trang chủ' },
  { name: 'Courses', href: '/courses', icon: BookOpen, label: 'Khóa học' },
  { name: 'Chat', href: '/chat', icon: MessageCircle, label: 'Thảo luận' },
  { name: 'Events', href: '/events', icon: Calendar, label: 'Sự kiện' },
  { name: 'Resources', href: '/documents', icon: FileText, label: 'Tài liệu' },
  { name: 'Ranking', href: '/members', icon: Trophy, label: 'Xếp hạng' },
];

const Web3Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) => {
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
        "fixed left-0 top-0 z-50 h-full w-20 glass-card border-r border-purple-500/20 transition-all duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-purple-500/20">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-xl flex items-center justify-center neon-purple glow-pulse">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="ml-3">
              <span className="text-lg font-bold font-space gradient-web3-text">
                AI Club
              </span>
              <div className="text-xs text-purple-300">Plus</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative",
                  isActive 
                    ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border border-purple-500/30 neon-purple" 
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-6 h-6 transition-colors flex-shrink-0",
                  isActive ? "text-purple-400" : "text-slate-400 group-hover:text-purple-400"
                )} />
                
                {isOpen && (
                  <>
                    <span className="ml-3 font-medium font-inter">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    )}
                  </>
                )}
                
                {!isOpen && isActive && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile - chỉ hiển thị khi sidebar mở */}
        {isOpen && (
          <div className="p-4 border-t border-purple-500/20">
            <div className="flex items-center space-x-3 p-3 rounded-xl glass">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-semibold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">AI Learner</p>
                <p className="text-xs text-purple-300">Level 12 • VIP</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Web3Sidebar;
