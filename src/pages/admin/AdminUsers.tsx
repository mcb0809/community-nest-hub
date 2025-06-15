
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UserTable from '@/components/admin/users/UserTable';
import UserDetailDrawer from '@/components/admin/users/UserDetailDrawer';
import XPConfigForm from '@/components/admin/users/XPConfigForm';
import XPLogChart from '@/components/admin/users/XPLogChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, BarChart3, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { recalculateUserStats } from '@/hooks/useLeaderboardRealtime';

const AdminUsers = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch users with stats
  const { data: users = [], isLoading, refetch } = useQuery({
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
  const onlineUsers = users.filter(u => u.is_online).length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newUsersThisWeek = users.filter(u => 
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
          <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
            <Settings className="w-4 h-4 mr-2" />
            XP Settings
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
          <XPLogChart />
        </TabsContent>

        <TabsContent value="settings">
          <XPConfigForm />
        </TabsContent>
      </Tabs>

      {selectedUserId && (
        <UserDetailDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
