import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  Trophy,
  Crown,
  TrendingUp,
  Zap
} from 'lucide-react';
import MemberCard from '@/components/members/MemberCard';
import LeaderboardHeader from '@/components/members/LeaderboardHeader';
import XPExplanationModal from "@/components/members/XPExplanationModal";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ChevronDown } from "lucide-react";

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

// Định nghĩa hàm tính dữ liệu leaderboard: nhận logs, trả về user info với xp, level, streak...
function getLeaderboardData() {
  // Dữ liệu bên dưới nên lấy từ backend thực, đây đang mock để dùng thử
  const membersData = [
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
    },
    {
      id: '6',
      name: 'Thảo My',
      avatar: '',
      level: 29,
      xp: 3200,
      maxXp: 5000,
      rank: 6,
      totalPoints: 58420,
      coursesCompleted: 11,
      streak: 12,
      joinDate: '2023-06-10',
      badges: ['Newcomer Champion'],
      isOnline: true
    },
    {
      id: '7',
      name: 'Văn Hùng',
      avatar: '',
      level: 27,
      xp: 1800,
      maxXp: 4500,
      rank: 7,
      totalPoints: 52180,
      coursesCompleted: 10,
      streak: 8,
      joinDate: '2023-07-05',
      badges: ['Persistent'],
      isOnline: false
    },
    {
      id: '8',
      name: 'Kim Liên',
      avatar: '',
      level: 25,
      xp: 2100,
      maxXp: 4000,
      rank: 8,
      totalPoints: 48760,
      coursesCompleted: 9,
      streak: 25,
      joinDate: '2023-08-18',
      badges: ['Streak Master', 'Dedicated'],
      isOnline: true
    }
  ];
  // Giả sử mỗi member đã có xp → tính level, progress %
  return membersData.map(mem => {
    const lv = getLevel(mem.xp);
    return { ...mem, level: lv.level, maxXp: lv.maxXp, levelProgress: lv.progress };
  });
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

  // Sử dụng getLeaderboardData() thay cho mảng members
  const members = getLeaderboardData();

  // Bổ sung lọc theo Level
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'top10' && member.rank <= 10) ||
      (filterType === 'online' && member.isOnline) ||
      (filterType === 'streak' && member.streak >= 20);
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

      {/* Move XPExplanationModal to always be rendered at the end for correct stacking context */}
      <XPExplanationModal
        open={showXPModal}
        onOpenChange={setShowXPModal}
      />
    </div>
  );
};

export default Members;
