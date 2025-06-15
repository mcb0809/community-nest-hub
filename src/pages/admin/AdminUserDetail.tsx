
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserDetailDrawer from '@/components/admin/users/UserDetailDrawer';

const AdminUserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/admin/users');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={handleClose}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold text-white">Chi tiết người dùng</h1>
      </div>

      <UserDetailDrawer
        userId={userId || null}
        isOpen={true}
        onClose={handleClose}
      />
    </div>
  );
};

export default AdminUserDetail;
