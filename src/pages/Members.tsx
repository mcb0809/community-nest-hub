import React, { useState } from 'react';
import MemberCard from '@/components/members/MemberCard';
import LeaderboardHeader from '@/components/members/LeaderboardHeader';
import XPExplanationModal from "@/components/members/XPExplanationModal";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Trophy,
  Crown,
  TrendingUp,
  Zap,
  RefreshCw,
  MessageSquare,
  FileText
} from 'lucide-react';
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { useLeaderboardRealtime, recalculateUserStats } from '@/hooks/useLeaderboardRealtime';
import { useToast } from '@/hooks/use-toast';
import { useOnlineTracking } from '@/hooks/useOnlineTracking';

const levelThresholds = [1000, 1500, 2000, 2800, 4000, 6000, 8500, 12000, 18000];

function getLevel(xp: number) {
  let level = 1, acc = 0;
  for (let i = 0; i < levelThresholds.length; i++) {
    acc += levelThresholds[i];
    if (xp < acc) {
      return {
        level: i + 1,
        progress: Math.round((xp - (acc - levelThresholds[i])) * 100 / levelThresholds[i]),
        maxXp: acc,
      };
    }
  }
  return { level: 10, progress: 100, maxXp: acc };
}

const filterOptions = [
  { value: 'all', label: 'Tất cả', icon: Trophy },
  { value: 'top10', label: 'Top 10', icon: Crown },
  { value: 'online', label: 'Đang online', icon: TrendingUp },
  { value: 'streak', label: 'Streak cao', icon: Zap },
  { value: 'chatters', label: 'Hay đăng bài', icon: FileText },
];

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showXPModal, setShowXPModal] = useState(false);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Initialize online tracking for current user
  useOnlineTracking();

  // Get realtime data from Supabase using the updated hook
  const { users: members, loading } = useLeaderboardRealtime();

  // Handle manual refresh/recalculation
  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    try {
      await recalculateUserStats();
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

  // Transform and add required fields for MemberCard with better error handling
  const membersWithStats = members.map((member, i) => {
    const levelData = getLevel(member.xp || 0);
    return {
      ...member,
      avatar: member.avatar ?? '',
      badges: Array.isArray(member.badges) ? member.badges : [],
      title: member.title ?? '',
      rank: i + 1,
      totalPoints: member.xp || 0,
      maxXp: levelData.maxXp,
      level: levelData.level,
      levelProgress: Math.max(0, Math.min(100, member.levelProgress || 0)),
      coursesCompleted: member.coursesCompleted ?? 0,
      streak: member.streak ?? 0,
      joinDate: member.joinDate ?? new Date().toISOString(),
      isOnline: typeof member.isOnline === "boolean" ? member.isOnline : false,
      messagesCount: member.postsCount ?? 0, // Use postsCount from the hook
    };
  });

  // Filter members with better validation
  const filteredMembers = membersWithStats.filter(member => {
    const matchesSearch = (member.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'top10' && member.rank <= 10) ||
      (filterType === 'online' && member.isOnline) ||
      (filterType === 'streak' && (member.streak || 0) >= 7) ||
      (filterType === 'chatters' && (member.messagesCount || 0) >= 1); // Changed threshold to 1 post
    const matchesLevel = levelFilter ? member.level === levelFilter : true;
    return matchesSearch && matchesFilter && matchesLevel;
  });

  // Calculate stats for header with safe defaults
  const totalMembers = members.length;
  const onlineMembers = members.filter(m => m.isOnline).length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newMembersThisWeek = members.filter(m => {
    try {
      return new Date(m.joinDate) > weekAgo;
    } catch {
      return false;
    }
  }).length;
  const activePercentage = totalMembers > 0 
    ? Math.round((onlineMembers / totalMembers) * 100) 
    : 0;

  // Get most active poster safely
  const mostActivePoster = membersWithStats.length > 0 
    ? membersWithStats.reduce((prev, current) => 
        (prev.postsCount || 0) > (current.postsCount || 0) ? prev : current
      )
    : null;

  // Only show most active poster if they actually have posts
  const hasActivePoster = mostActivePoster && (mostActivePoster.postsCount || 0) > 0;

  const topUsers = [
    {
      name: filteredMembers[0]?.name || "Chưa có dữ liệu",
      achievement: `Rank #1 với ${(filteredMembers[0]?.totalPoints || 0).toLocaleString()} XP`,
      value: filteredMembers[0]?.totalPoints || 0
    },
    {
      name: hasActivePoster ? mostActivePoster.name : "Chưa có dữ liệu",
      achievement: hasActivePoster ? `${mostActivePoster.postsCount} bài viết đã đăng` : "Chưa có ai đăng bài viết",
      value: hasActivePoster ? mostActivePoster.postsCount : 0
    },
    {
      name: onlineMembers > 0 ? `${onlineMembers} thành viên` : "Chưa có dữ liệu",
      achievement: "đang online",
      value: onlineMembers
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải bảng xếp hạng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Gamification Header with real stats */}
      <LeaderboardHeader 
        totalMembers={totalMembers}
        onlineMembers={onlineMembers}
        newMembersThisWeek={newMembersThisWeek}
        activePercentage={activePercentage}
        topUsers={topUsers}
      />

      {/* Section Highlight Tuần này - Updated to show posts */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-purple-500/20 rounded-xl py-3 px-4">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-semibold">
            {filteredMembers[0]?.name || 'Chưa có dữ liệu'}
          </span>
          <span className="text-sm text-slate-400">– Rank #1 với {(filteredMembers[0]?.totalPoints || 0).toLocaleString()} XP</span>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-xl py-3 px-4">
          <FileText className="w-5 h-5 text-blue-400" />
          <span className="text-white font-semibold">
            {hasActivePoster ? mostActivePoster.name : 'Chưa có dữ liệu'}
          </span>
          <span className="text-sm text-slate-400">
            – {hasActivePoster ? `${mostActivePoster.postsCount} bài viết` : 'Chưa có ai đăng bài viết'}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-xl py-3 px-4">
          <Crown className="w-5 h-5 text-purple-400" />
          <span className="text-white font-semibold">
            {onlineMembers} thành viên
          </span>
          <span className="text-sm text-slate-400">– đang online</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="glass-card border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="Tìm kiếm thành viên..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filterType === option.value ? "default" : "outline"}
                  onClick={() => setFilterType(option.value)}
                  className={`flex items-center gap-2 ${
                    filterType === option.value 
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' 
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </Button>
              ))}
              
              {/* Level Filter */}
              <div className="relative">
                <Button
                  variant="outline"
                  className="flex items-center gap-1 border-slate-600 text-slate-300 px-3"
                  onClick={() => setLevelFilter(levelFilter ? null : 1)}
                >
                  {levelFilter ? `Level ${levelFilter}` : 'Lọc Level'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
                {levelFilter !== null && (
                  <div className="absolute bg-slate-900 rounded shadow-md mt-1 z-10">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className="px-4 py-2 hover:bg-purple-500/20 cursor-pointer text-white"
                        onClick={() => setLevelFilter(i + 1)}>
                        Level {i + 1}
                      </div>
                    ))}
                    <div className="px-4 py-2 text-slate-400 cursor-pointer" onClick={() => setLevelFilter(null)}>Bỏ lọc</div>
                  </div>
                )}
              </div>

              {/* XP Info Button */}
              <Button
                variant="outline"
                className="flex items-center gap-1 border-slate-600 text-slate-300 px-3"
                onClick={() => setShowXPModal(true)}
              >
                🔎 XP là gì?
              </Button>

              {/* Refresh Stats Button */}
              <Button
                variant="outline"
                className="flex items-center gap-1 border-slate-600 text-slate-300 px-3"
                onClick={handleRefreshStats}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Cập nhật
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Leaderboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map((member, index) => (
          <MemberCard key={member.id} member={member} index={index} />
        ))}
      </div>

      {/* No Results */}
      {filteredMembers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Không tìm thấy thành viên
          </h3>
          <p className="text-slate-400">
            {members.length === 0 
              ? "Chưa có thành viên nào trong hệ thống" 
              : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"}
          </p>
        </div>
      )}

      {/* Call to Action */}
      <Card className="glass-card border-slate-700/50 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Tham gia cuộc đua!</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Hoàn thành khóa học, tích lũy điểm và leo lên bảng xếp hạng. Đăng bài viết để tích lũy thêm XP!
          </p>
          <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold px-8 py-3">
            Bắt đầu học ngay
          </Button>
        </CardContent>
      </Card>

      {/* Modal giải thích XP */}
      <XPExplanationModal
        open={showXPModal}
        onOpenChange={setShowXPModal}
      />
    </div>
  );
};

export default Members;
