
import React, { useState, useEffect } from 'react';
import { X, User, Calendar, TrendingUp, Award, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import XPLogChart from './XPLogChart';

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  role: string;
  created_at: string;
}

interface UserStats {
  total_xp: number;
  level: number;
  posts_count: number;
  courses_completed: number;
  streak_days: number;
  last_activity: string | null;
}

interface XPLog {
  id: string;
  action_type: string;
  xp_earned: number;
  description: string | null;
  created_at: string;
}

interface UserDetailDrawerProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailDrawer = ({ userId, isOpen, onClose }: UserDetailDrawerProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [xpLogs, setXpLogs] = useState<XPLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserDetails();
    }
  }, [userId, isOpen]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Fetch user profile
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setUser(userProfile);

      // Fetch user stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }
      setUserStats(stats);

      // Fetch XP logs
      const { data: logs, error: logsError } = await supabase
        .from('xp_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setXpLogs(logs || []);

    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin chi tiết người dùng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
      <div className="w-full max-w-2xl h-full bg-slate-900 border-l border-slate-700 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Chi tiết người dùng</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : user ? (
          <div className="p-6 space-y-6">
            {/* User Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-full flex items-center justify-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.display_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    {userStats && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-800 rounded-full border-2 border-purple-500 flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-300">{userStats.level}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{user.display_name}</h3>
                    <p className="text-slate-400">{user.email}</p>
                    <Badge className="mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Calendar className="w-4 h-4" />
                    <span>Tham gia: {new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      Hoạt động cuối: {userStats?.last_activity 
                        ? new Date(userStats.last_activity).toLocaleDateString('vi-VN')
                        : 'Chưa có hoạt động'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            {userStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{userStats.total_xp.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">Tổng XP</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{userStats.level}</p>
                    <p className="text-sm text-slate-400">Level</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{userStats.posts_count}</p>
                    <p className="text-sm text-slate-400">Bài viết</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{userStats.streak_days}</p>
                    <p className="text-sm text-slate-400">Ngày streak</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* XP Chart */}
            {xpLogs.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Biểu đồ tích lũy XP</CardTitle>
                </CardHeader>
                <CardContent>
                  <XPLogChart xpLogs={xpLogs} />
                </CardContent>
              </Card>
            )}

            {/* Recent XP Logs */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Lịch sử XP gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                {xpLogs.length > 0 ? (
                  <div className="space-y-3">
                    {xpLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{log.action_type}</p>
                          {log.description && (
                            <p className="text-sm text-slate-400">{log.description}</p>
                          )}
                          <p className="text-xs text-slate-500">
                            {new Date(log.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">+{log.xp_earned} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">Chưa có lịch sử XP</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400">Không tìm thấy thông tin người dùng</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailDrawer;
