
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
  Zap
} from 'lucide-react';
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { useLeaderboardRealtime } from '@/hooks/useLeaderboardRealtime';

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
];

// Bộ lọc thêm
const extraFilters = [
  { value: 'level', label: 'Level', options: Array.from({ length: 10 }, (_, i) => i + 1) },
  { value: 'streak', label: 'Streak 7+', options: [] },
  { value: 'xp', label: 'XP 10k+', options: [] },
];

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showXPModal, setShowXPModal] = useState(false);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  // Lấy dữ liệu realtime từ Supabase
  const { users: members, loading } = useLeaderboardRealtime();

  // Chuẩn hóa và bổ sung các trường cần thiết cho MemberCard
  const membersWithStats = members.map((member, i) => {
    // Convert some fallback fields for compatibility
    const levelData = getLevel(member.xp || 0);
    return {
      ...member,
      avatar: member.avatar ?? '', // fallback nếu Supabase trả về null
      badges: Array.isArray(member.badges) ? member.badges : [],
      title: member.title ?? '',
      rank: i + 1,
      totalPoints: member.xp,
      maxXp: levelData.maxXp,
      level: levelData.level,
      levelProgress: levelData.progress,
      // fallback nếu thiếu trường (giữ UI không crash)
      coursesCompleted: member.coursesCompleted ?? 0,
      streak: member.streak ?? 0,
      joinDate: member.joinDate ?? '',
      isOnline: typeof member.isOnline === "boolean" ? member.isOnline : false,
    };
  });

  // Bổ sung lọc theo Level
  const filteredMembers = membersWithStats.filter(member => {
    const matchesSearch = (member.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'top10' && member.rank <= 10) ||
      (filterType === 'online' && member.isOnline) ||
      (filterType === 'streak' && member.streak >= 7);
    const matchesLevel = levelFilter ? member.level === levelFilter : true;
    return matchesSearch && matchesFilter && matchesLevel;
  });

  return (
    <div className="space-y-8">
      {/* Gamification Header */}
      <LeaderboardHeader />

      {/* Section Highlight Tuần này */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-purple-500/20 rounded-xl py-3 px-4">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-semibold">Hoàng Minh</span>
          <span className="text-sm text-slate-400">– Hoàn thành 5 khóa học</span>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-400/20 to-cyan-500/20 rounded-xl py-3 px-4">
          <Zap className="w-5 h-5 text-green-400" />
          <span className="text-white font-semibold">Lan Anh</span>
          <span className="text-sm text-slate-400">– 30 ngày streak</span>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-xl py-3 px-4">
          <Crown className="w-5 h-5 text-purple-400" />
          <span className="text-white font-semibold">Đức Thành</span>
          <span className="text-sm text-slate-400">– Top 1 điểm số tháng</span>
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
              {/* Bộ lọc theo Level */}
              <div className="relative">
                <Button
                  variant="outline"
                  className="flex items-center gap-1 border-slate-600 text-slate-300 px-3"
                  onClick={() => setLevelFilter(levelFilter ? null : 1)}
                >
                  Lọc Level
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
              {/* Nút mở Modal XP */}
              <Button
                variant="outline"
                className="flex items-center gap-1 border-slate-600 text-slate-300 px-3"
                onClick={() => setShowXPModal(true)}
              >
                🔎 XP là gì?
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
      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Không tìm thấy thành viên
          </h3>
          <p className="text-slate-400">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
          </p>
        </div>
      )}

      {/* Call to Action */}
      <Card className="glass-card border-slate-700/50 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Tham gia cuộc đua!</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Hoàn thành khóa học, tích lũy điểm và leo lên bảng xếp hạng. Bạn có thể đánh bại được những người đứng đầu không?
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
