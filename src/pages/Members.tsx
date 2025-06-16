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
  FileText,
  ChevronDown 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleLeaderboard } from '@/hooks/useSimpleLeaderboard';
import { useLevelConfig } from '@/hooks/useLevelConfig';
import { useToast } from '@/hooks/use-toast';

export default function Members() {
  const { users, loading } = useSimpleLeaderboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [showXPModal, setShowXPModal] = useState(false);
  const { toast } = useToast();

  // Filter members based on search query
  const filteredMembers = React.useMemo(() => {
    return users.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await window.location.reload();
      toast({
        title: "Refreshed",
        description: "Member list has been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh member list",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <LeaderboardHeader />

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm thành viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowXPModal(true)}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Cách tính XP
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Crown className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-slate-400">Top contributor</p>
                <p className="font-semibold">{users[0]?.name || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-slate-400">Total members</p>
                <p className="font-semibold">{users.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-slate-400">Total posts</p>
                <p className="font-semibold">
                  {users.reduce((sum, user) => sum + user.postsCount, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <FileText className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-slate-400">Active streaks</p>
                <p className="font-semibold">
                  {users.filter(user => user.streak > 0).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-slate-400">Loading members...</p>
        </div>
      )}

      {/* Members Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member, index) => (
            <MemberCard key={member.id} member={member} index={index} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Không tìm thấy thành viên
          </h3>
          <p className="text-slate-400">
            {users.length === 0 
              ? "Chưa có thành viên nào trong hệ thống" 
              : "Thử thay đổi từ khóa tìm kiếm"}
          </p>
        </div>
      )}

      {/* XP Explanation Modal */}
      <XPExplanationModal 
        isOpen={showXPModal} 
        onClose={() => setShowXPModal(false)} 
      />
    </div>
  );
}
