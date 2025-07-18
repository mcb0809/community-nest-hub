
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangeAvatarModal = ({ isOpen, onClose }: ChangeAvatarModalProps) => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!avatarUrl.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập URL avatar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ avatar_url: avatarUrl.trim() })
        .eq('id', userProfile?.id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã cập nhật avatar thành công",
      });
      
      setAvatarUrl('');
      onClose();
      
      // Reload page to update avatar everywhere
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi cập nhật avatar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Thay đổi Avatar</DialogTitle>
          <DialogDescription className="text-slate-400">
            Nhập URL hình ảnh để thay đổi avatar
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl || userProfile?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-600 text-white text-lg">
              {userProfile?.display_name ? getInitials(userProfile.display_name) : 'A'}
            </AvatarFallback>
          </Avatar>
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <Label htmlFor="avatarUrl" className="text-slate-300">
                URL Avatar
              </Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                disabled={loading}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeAvatarModal;
