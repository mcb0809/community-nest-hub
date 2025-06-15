
import React from 'react';
import { Eye, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserWithStats {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  role: string;
  created_at: string;
  user_stats?: {
    total_xp: number;
    level: number;
    posts_count: number;
    courses_completed: number;
    last_activity: string | null;
  } | null;
}

interface UserTableProps {
  users: UserWithStats[];
  onViewDetails: (userId: string) => void;
}

const UserTable = ({ users, onViewDetails }: UserTableProps) => {
  const roleColors = {
    admin: 'bg-red-500/20 text-red-400',
    moderator: 'bg-yellow-500/20 text-yellow-400',
    member: 'bg-blue-500/20 text-blue-400',
  };

  const isOnline = (lastActivity: string | null) => {
    if (!lastActivity) return false;
    const now = new Date();
    const activity = new Date(lastActivity);
    const diffMinutes = (now.getTime() - activity.getTime()) / (1000 * 60);
    return diffMinutes < 30; // Consider online if active within 30 minutes
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-700">
          <TableHead className="text-slate-300">Người dùng</TableHead>
          <TableHead className="text-slate-300">Email</TableHead>
          <TableHead className="text-slate-300">Level/XP</TableHead>
          <TableHead className="text-slate-300">Hoạt động</TableHead>
          <TableHead className="text-slate-300">Trạng thái</TableHead>
          <TableHead className="text-slate-300">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/30">
            <TableCell>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {user.display_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {user.user_stats && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-800 rounded-full border border-purple-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-300">{user.user_stats.level}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">{user.display_name}</p>
                  <Badge className={roleColors[user.role as keyof typeof roleColors] || 'bg-gray-500/20 text-gray-400'}>
                    {user.role}
                  </Badge>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-slate-300">
              {user.email ? (
                <div className="max-w-[200px]">
                  <p className="truncate" title={user.email}>{user.email}</p>
                </div>
              ) : (
                <span className="text-slate-500 italic">Chưa có email</span>
              )}
            </TableCell>
            <TableCell>
              {user.user_stats ? (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-400 font-semibold">Level {user.user_stats.level}</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    {user.user_stats.total_xp.toLocaleString()} XP
                  </div>
                </div>
              ) : (
                <span className="text-slate-500 italic">Chưa có dữ liệu</span>
              )}
            </TableCell>
            <TableCell>
              {user.user_stats ? (
                <div className="space-y-1">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-slate-300">{user.user_stats.posts_count} bài viết</span>
                    <span className="text-slate-300">{user.user_stats.courses_completed} khóa học</span>
                  </div>
                </div>
              ) : (
                <span className="text-slate-500 italic">-</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  user.user_stats && isOnline(user.user_stats.last_activity) 
                    ? 'bg-green-500' 
                    : 'bg-gray-500'
                }`}></div>
                <span className="text-sm text-slate-400">
                  {user.user_stats && isOnline(user.user_stats.last_activity) ? 'Online' : 'Offline'}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(user.id)}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
