
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UserTable from '@/components/admin/users/UserTable';
import UserDetailDrawer from '@/components/admin/users/UserDetailDrawer';
import XPConfigForm from '@/components/admin/users/XPConfigForm';
import LevelConfigForm from '@/components/admin/users/LevelConfigForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, BarChart3, RefreshCw, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { recalculateUserStats } from '@/hooks/useLeaderboardRealtime';

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
    messages_count: number;
    last_activity: string | null;
  } | null;
}

const AdminUsers = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch users with stats including message count
  const { data: rawUsers = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_leaderboard')
        .select('*')
        .order('total_xp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Transform the data to match UserWithStats interface
  const users: UserWithStats[] = rawUsers.map((user: any) => ({
    id: user.id,
    display_name: user.name || 'Anonymous',
    avatar_url: user.avatar,
    email: user.email,
    role: 'member', // Default role, could be enhanced later
    created_at: user.joined_at,
    user_stats: {
      total_xp: user.total_xp || 0,
      level: user.level || 1,
      posts_count: user.posts_count || 0,
      courses_completed: user.courses_completed || 0,
      messages_count: user.messages_count || 0, // Now properly included
      last_activity: user.last_activity,
    }
  }));

  // Handle manual refresh/recalculation
  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    try {
      await recalculateUserStats();
      await refetch();
      toast({
        title: "Stats Updated",
        description: "All user statistics have been recalculated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh statistics",
        variant: "destructive",
      });
    }
    setIsRefreshing(false);
  };

  // Calculate stats for the admin header
  const totalUsers = users.length;
  const onlineUsers = rawUsers.filter((u: any) => u.is_online).length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newUsersThisWeek = rawUsers.filter((u: any) => 
    new Date(u.joined_at) > weekAgo
  ).length;
  const activePercentage = totalUsers > 0 
    ? Math.round((onlineUsers / totalUsers) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Admin Header with Stats */}
      <Card className="border-slate-700/50 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              User Management
            </div>
            <Button
              variant="outline"
              onClick={handleRefreshStats}
              disabled={isRefreshing}
              className="border-slate-600 text-slate-300"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</div>
              <div className="text-sm text-slate-400">Total Users</div>
            </div>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{onlineUsers}</div>
              <div className="text-sm text-slate-400">Online Now</div>
            </div>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{activePercentage}%</div>
              <div className="text-sm text-slate-400">Active This Week</div>
            </div>
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">+{newUsersThisWeek}</div>
              <div className="text-sm text-slate-400">New This Week</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="xp-settings" className="data-[state=active]:bg-slate-700">
            <Settings className="w-4 h-4 mr-2" />
            XP Settings
          </TabsTrigger>
          <TabsTrigger value="level-settings" className="data-[state=active]:bg-slate-700">
            <Trophy className="w-4 h-4 mr-2" />
            Level Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserTable 
            users={users} 
            isLoading={isLoading}
            onUserSelect={setSelectedUserId}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">XP Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Select a user from the Users tab to view detailed XP analytics.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="xp-settings">
          <XPConfigForm />
        </TabsContent>

        <TabsContent value="level-settings">
          <LevelConfigForm />
        </TabsContent>
      </Tabs>

      {selectedUserId && (
        <UserDetailDrawer
          userId={selectedUserId}
          isOpen={true}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
