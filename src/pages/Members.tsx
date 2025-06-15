
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

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data với hệ thống gamification
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

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'top10' && member.rank <= 10) ||
      (filterType === 'online' && member.isOnline) ||
      (filterType === 'streak' && member.streak >= 20);
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { value: 'all', label: 'Tất cả', icon: Trophy },
    { value: 'top10', label: 'Top 10', icon: Crown },
    { value: 'online', label: 'Đang online', icon: TrendingUp },
    { value: 'streak', label: 'Streak cao', icon: Zap },
  ];

  return (
    <div className="space-y-8">
      {/* Gamification Header */}
      <LeaderboardHeader />

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
    </div>
  );
};

export default Members;
