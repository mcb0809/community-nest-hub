
import React from 'react';
import { Bell, Search, Menu, Sun, Moon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Web3ProfileDropdown from './Web3ProfileDropdown';

const Web3Header = ({ 
  toggleSidebar, 
  darkMode, 
  toggleDarkMode 
}: { 
  toggleSidebar: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}) => {
  return (
    <header className="h-16 glass-card border-b border-purple-500/20 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSidebar}
          className="lg:hidden text-white hover:bg-white/10"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-4 h-4" />
          <Input 
            placeholder="Tìm kiếm khóa học, sự kiện, tài liệu..." 
            className="pl-10 w-80 glass border-purple-500/30 text-white placeholder-purple-300"
          />
        </div>
      </div>

      {/* Center - Brand for larger screens */}
      <div className="hidden lg:flex items-center space-x-2">
        <span className="text-xl font-bold font-space gradient-web3-text">
          AI Automation Club Plus
        </span>
        <div className="flex items-center space-x-1">
          <Zap className="w-4 h-4 text-cyan-400" />
          <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
            Premium
          </Badge>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={toggleDarkMode}
          className="text-purple-300 hover:bg-white/10 hover:text-white"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        
        <Button variant="ghost" size="sm" className="relative text-purple-300 hover:bg-white/10 hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-xs flex items-center justify-center text-white animate-pulse">
            5
          </span>
        </Button>
        
        <Web3ProfileDropdown />
        
        {/* Level indicator */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-purple-300">Level 12</span>
          <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-cyan-500"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Web3Header;
