
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Trophy, 
  Medal, 
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

const LeaderboardHeader = () => {
  const stats = [
    {
      icon: Users,
      label: 'Tổng thành viên',
      value: '2,847',
      color: 'text-blue-400'
    },
    {
      icon: Crown,
      label: 'Thành viên VIP',
      value: '156',
      color: 'text-yellow-400'
    },
    {
      icon: TrendingUp,
      label: 'Hoạt động tuần này',
      value: '89%',
      color: 'text-green-400'
    },
    {
      icon: Calendar,
      label: 'Tham gia mới',
      value: '+47',
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Bảng Xếp Hạng
          </h1>
        </div>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Khám phá những người học giỏi nhất trong cộng đồng. Hoàn thành khóa học, tích lũy điểm và leo lên top!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-card border-slate-700/50 hover:border-purple-500/30 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-full bg-slate-800/50 border border-slate-700">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Achievements */}
      <Card className="glass-card border-slate-700/50 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Medal className="w-5 h-5 mr-2 text-yellow-400" />
              Thành tựu nổi bật tuần này
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="font-semibold text-white">Hoàng Minh</p>
              <p className="text-sm text-slate-400">Hoàn thành 5 khóa học</p>
            </div>
            <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="font-semibold text-white">Lan Anh</p>
              <p className="text-sm text-slate-400">30 ngày streak học tập</p>
            </div>
            <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="font-semibold text-white">Đức Thành</p>
              <p className="text-sm text-slate-400">Top 1 điểm số tháng</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardHeader;
