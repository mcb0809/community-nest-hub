
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
  role: string;
}

interface EditUserModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: UserProfile) => void;
}

const EditUserModal = ({ user, isOpen, onClose, onUserUpdated }: EditUserModalProps) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      setDisplayName(user.display_name);
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          display_name: displayName,
          email: email 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update the user in the parent component
      onUserUpdated({
        ...user,
        display_name: displayName,
        email: email
      });

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin người dùng",
      });

      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin người dùng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">Tên hiển thị</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
