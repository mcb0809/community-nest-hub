
import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Edit, Trash2, Shield, Mail, Calendar, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EditUserModal from '@/components/admin/EditUserModal';
import MemberCard from '@/components/members/MemberCard';
import LeaderboardHeader from '@/components/members/LeaderboardHeader';

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('management');
  const { toast } = useToast();

  // Mock gamification data for members tab
  const members = [
    {
      id: '1',
      name: 'Hoàng Minh',
      avatar: '',
      level: 47,
      xp: 8950,
      maxXp: 10000,
      rank: 1,
      totalPoints: 125840,
      coursesCompleted: 23,
      streak: 45,
      joinDate: '2023-01-15',
      badges: ['Founder', 'Master Learner', 'Streak King', 'Course Crusher'],
      isOnline: true,
      title: 'Học viên xuất sắc'
    },
    {
      id: '2',
      name: 'Lan Anh Nguyen',
      avatar: '',
      level: 42,
      xp: 6750,
      maxXp: 8500,
      rank: 2,
      totalPoints: 98650,
      coursesCompleted: 19,
      streak: 30,
      joinDate: '2023-02-20',
      badges: ['Top Contributor', 'Study Buddy', 'Achievement Hunter'],
      isOnline: true,
      title: 'Cộng tác viên tích cực'
    },
    {
      id: '3',
      name: 'Đức Thành',
      avatar: '',
      level: 38,
      xp: 4200,
      maxXp: 7500,
      rank: 3,
      totalPoints: 87320,
      coursesCompleted: 16,
      streak: 22,
      joinDate: '2023-03-10',
      badges: ['Fast Learner', 'Quiz Master', 'Dedicated'],
      isOnline: false,
      title: 'Học sinh chăm chỉ'
    },
    {
      id: '4',
      name: 'Mai Phương',
      avatar: '',
      level: 35,
      xp: 2800,
      maxXp: 6000,
      rank: 4,
      totalPoints: 76540,
      coursesCompleted: 14,
      streak: 18,
      joinDate: '2023-04-15',
      badges: ['Consistent', 'Team Player'],
      isOnline: true
    },
    {
      id: '5',
      name: 'Tuấn Anh',
      avatar: '',
      level: 32,
      xp: 1950,
      maxXp: 5500,
      rank: 5,
      totalPoints: 65890,
      coursesCompleted: 12,
      streak: 15,
      joinDate: '2023-05-20',
      badges: ['Rising Star', 'Active'],
      isOnline: false
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Thành công",
        description: "Đã cập nhật quyền người dùng",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật quyền người dùng",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleUserUpdated = (updatedUser: UserProfile) => {
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    admin: 'bg-red-500/20 text-red-400',
    moderator: 'bg-yellow-500/20 text-yellow-400',
    member: 'bg-blue-500/20 text-blue-400',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý người dùng</h1>
          <p className="text-slate-400">Quản lý tài khoản, quyền người dùng và bảng xếp hạng trong hệ thống</p>
        </div>
        
        <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-700">
          <TabsTrigger 
            value="management" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Quản lý Users
          </TabsTrigger>
          <TabsTrigger 
            value="leaderboard"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Bảng xếp hạng
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="management" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                  <p className="text-sm text-slate-400">Tổng người dùng</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{users.filter(u => u.role === 'admin').length}</p>
                  <p className="text-sm text-slate-400">Admin</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{users.filter(u => u.role === 'moderator').length}</p>
                  <p className="text-sm text-slate-400">Moderator</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{users.filter(u => u.role === 'member').length}</p>
                  <p className="text-sm text-slate-400">Member</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm người dùng (tên hoặc email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                  <Filter className="w-4 h-4 mr-2" />
                  {roleFilter === 'all' ? 'Tất cả quyền' : roleFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-600">
                <DropdownMenuItem
                  onClick={() => setRoleFilter('all')}
                  className="text-white hover:bg-slate-700"
                >
                  Tất cả quyền
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setRoleFilter('admin')}
                  className="text-white hover:bg-slate-700"
                >
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setRoleFilter('moderator')}
                  className="text-white hover:bg-slate-700"
                >
                  Moderator
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setRoleFilter('member')}
                  className="text-white hover:bg-slate-700"
                >
                  Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Users Table */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Người dùng</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Quyền</TableHead>
                    <TableHead className="text-slate-300">Ngày tạo</TableHead>
                    <TableHead className="text-slate-300">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center">
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
                          <div>
                            <p className="font-medium text-white">{user.display_name}</p>
                            <p className="text-sm text-slate-400 truncate max-w-[200px]">{user.id}</p>
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
                        <Badge className={roleColors[user.role as keyof typeof roleColors] || 'bg-gray-500/20 text-gray-400'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditUser(user)}
                            className="text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                                <Shield className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-600">
                              <DropdownMenuItem
                                onClick={() => updateUserRole(user.id, 'admin')}
                                className="text-white hover:bg-slate-700"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Đặt làm Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateUserRole(user.id, 'moderator')}
                                className="text-white hover:bg-slate-700"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Đặt làm Moderator
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateUserRole(user.id, 'member')}
                                className="text-white hover:bg-slate-700"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Đặt làm Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy người dùng</h3>
              <p className="text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-8">
          <LeaderboardHeader />
          
          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <EditUserModal
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};

export default AdminUsers;
