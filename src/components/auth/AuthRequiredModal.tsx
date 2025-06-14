
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

const AuthRequiredModal = ({ 
  isOpen, 
  onClose, 
  title = "Yêu cầu đăng nhập",
  description = "Bạn cần đăng nhập để truy cập tính năng này."
}: AuthRequiredModalProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/auth');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-purple-500/20 text-white max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-purple-400" />
          </div>
          <DialogTitle className="gradient-web3-text text-xl">{title}</DialogTitle>
          <DialogDescription className="text-slate-400 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-3 mt-6">
          <Button 
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Đăng nhập ngay
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Hủy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredModal;
