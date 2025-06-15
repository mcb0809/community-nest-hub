import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Crown, 
  Trophy, 
  Zap, 
  Star, 
  Award,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface MemberStats {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  maxXp: number;
  rank: number;
  totalPoints: number;
  coursesCompleted: number;
  streak: number;
  joinDate: string;
  badges: string[];
  isOnline: boolean;
  title?: string;
}

interface MemberCardProps {
  member: MemberStats;
  index: number;
}

const MemberCard = ({ member, index }: MemberCardProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Trophy className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-lg font-bold text-slate-400">#{rank}</span>;
    }
  };

  const getRankBorderColor = (rank: number) => {
    switch (rank) {
      case 1: return 'border-yellow-400/50 bg-gradient-to-br from-yellow-500/10 to-amber-500/10';
      case 2: return 'border-gray-400/50 bg-gradient-to-br from-gray-500/10 to-slate-500/10';
      case 3: return 'border-amber-600/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10';
      default: return 'border-slate-700/50 bg-slate-800/30';
    }
  };

  const xpPercentage = (member.xp / member.maxXp) * 100;

  return (
    <Card className={`glass-card ${getRankBorderColor(member.rank)} hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10`}>
      <CardContent className="p-6">
        {/* Header with rank and online status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getRankIcon(member.rank)}
            {member.rank <= 3 && (
              <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30">
                TOP {member.rank}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <span className="text-xs text-slate-400">{member.isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Avatar and name */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <Avatar className="w-16 h-16 ring-2 ring-purple-500/30">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white font-semibold text-lg">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-full border-2 border-purple-500 flex items-center justify-center">
              <span className="text-xs font-bold text-purple-300">{member.level}</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">{member.name}</h3>
            {member.title && (
              <p className="text-sm text-purple-300 font-medium">{member.title}</p>
            )}
            <p className="text-xs text-slate-400">Tham gia {new Date(member.joinDate).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Level {member.level}</span>
            <span className="text-sm text-slate-300">{member.xp}/{member.maxXp} XP</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="font-bold text-white">{member.totalPoints.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400">Điểm tổng</p>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center justify-center mb-1">
              <Target className="w-4 h-4 text-green-400 mr-1" />
              <span className="font-bold text-white">{member.coursesCompleted}</span>
            </div>
            <p className="text-xs text-slate-400">Khóa học</p>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-center p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-500/30 mb-4">
          <Zap className="w-4 h-4 text-orange-400 mr-2" />
          <span className="text-sm font-semibold text-orange-300">{member.streak} ngày streak</span>
        </div>

        {/* Badges */}
        {member.badges.length > 0 && (
          <TooltipProvider>
            <div className="space-y-2">
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-2 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Huy hiệu</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {member.badges.slice(0, 3).map((badge, bidx) => (
                  <Tooltip key={bidx}>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300 cursor-pointer">
                        {badge}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{badge === "Master Learner"
                        ? "Hoàn thành 20+ khóa học"
                        : badge === "Streak King"
                        ? "Streak 30+ ngày liên tiếp"
                        : badge === "Course Crusher"
                        ? "Hoàn thành 10+ khóa học"
                        : badge}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {member.badges.length > 3 && (
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                    +{member.badges.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberCard;
