
import React, { useState } from 'react';
import { User, Settings, LogOut, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChangePasswordModal from './ChangePasswordModal';
import ChangeAvatarModal from './ChangeAvatarModal';

const ProfileDropdown = () => {
  const { userProfile, signOut } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-semibold">
                {userProfile?.display_name ? getInitials(userProfile.display_name) : 'A'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
          <div className="flex items-center space-x-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-600 text-white text-xs">
                {userProfile?.display_name ? getInitials(userProfile.display_name) : 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-white">{userProfile?.display_name}</p>
              <p className="text-xs text-slate-400">{userProfile?.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem 
            onClick={() => setShowAvatarModal(true)}
            className="text-slate-300 hover:bg-red-500/20 hover:text-white cursor-pointer"
          >
            <Upload className="mr-2 h-4 w-4" />
            <span>Thay đổi Avatar</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowPasswordModal(true)}
            className="text-slate-300 hover:bg-red-500/20 hover:text-white cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Đổi mật khẩu</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
      <ChangeAvatarModal 
        isOpen={showAvatarModal} 
        onClose={() => setShowAvatarModal(false)} 
      />
    </>
  );
};

export default ProfileDropdown;
