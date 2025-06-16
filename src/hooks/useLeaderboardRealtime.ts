import { useEffect, useState, useCallback, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useLevelConfig } from "./useLevelConfig";

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string | null;
  xp: number;
  level: number;
  levelProgress: number;
  coursesCompleted: number;
  streak: number;
  badges: string[];
  isOnline: boolean;
  joinDate: string;
  title?: string;
  postsCount: number;
  levelName?: string;
  levelColor?: string;
  levelIcon?: string;
}

export function useLeaderboardRealtime() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { levelConfigs, getLevelByNumber } = useLevelConfig();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

  const fetchLeaderboard = useCallback(async () => {
    if (levelConfigs.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [profilesResult, statsResult, postsResult] = await Promise.all([
        supabase
          .from("user_profiles")
          .select(`id, display_name, avatar_url, email, created_at`),
        supabase.from("user_stats").select("*"),
        supabase.from("posts").select("user_id").eq("visibility", "public")
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (statsResult.error) throw statsResult.error;
      if (postsResult.error) throw postsResult.error;

      const postsCounts: Record<string, number> = {};
      if (postsResult.data) {
        postsResult.data.forEach(post => {
          if (post.user_id) {
            postsCounts[post.user_id] = (postsCounts[post.user_id] || 0) + 1;
          }
        });
      }

      const calculateLevelProgress = (xp: number, currentLevel: number) => {
        if (!levelConfigs.length) return 0;
        const currentLevelConfig = getLevelByNumber(currentLevel);
        const nextLevelConfig = getLevelByNumber(currentLevel + 1);
        if (!currentLevelConfig) return 0;
        if (!nextLevelConfig) return 100;
        const currentLevelXp = currentLevelConfig.required_xp;
        const nextLevelXp = nextLevelConfig.required_xp;
        const progressXp = Math.max(0, xp - currentLevelXp);
        const requiredXp = nextLevelXp - currentLevelXp;
        return Math.min(100, Math.max(0, Math.round((progressXp / requiredXp) * 100)));
      };

      const mapped = (profilesResult.data || []).map((profile: any) => {
        const userStats = statsResult.data?.find(s => s.user_id === profile.id);
        const totalXp = userStats?.total_xp || 0;
        const level = userStats?.level || 1;
        const levelConfig = getLevelByNumber(level);

        return {
          id: profile.id,
          name: profile.display_name || 'Anonymous',
          avatar: profile.avatar_url,
          xp: totalXp,
          level: level,
          levelProgress: calculateLevelProgress(totalXp, level),
          coursesCompleted: userStats?.courses_completed ?? 0,
          streak: userStats?.current_streak ?? 0,
          badges: [],
          isOnline: false,
          joinDate: profile.created_at || new Date().toISOString(),
          title: undefined,
          postsCount: postsCounts[profile.id] || 0,
          levelName: levelConfig?.level_name,
          levelColor: levelConfig?.color,
          levelIcon: levelConfig?.icon,
        };
      });

      mapped.sort((a, b) => b.xp - a.xp);

      setUsers(currentUsers => {
        const onlineStatusMap = new Map(
          currentUsers.map(u => [u.id, u.isOnline])
        );
        return mapped.map(newUser => ({
          ...newUser,
          isOnline: onlineStatusMap.get(newUser.id) || false,
        }));
      });
    } catch (error) {
      console.error('Error in fetchLeaderboard:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [levelConfigs, getLevelByNumber]);

  // Initial data fetch
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Realtime subscription management
  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const setupChannel = async () => {
      if (!mounted) return;

      // Cleanup existing channel
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }

      // Create new channel
      const channelName = `leaderboard-${user.id}`;
      const channel = supabase.channel(channelName);
      channelRef.current = channel;

      const handleSync = () => {
        if (!mounted) return;
        
        const state = channel.presenceState();
        const onlineUserIds = new Set<string>();
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id) onlineUserIds.add(presence.user_id);
          });
        });

        setUsers(prevUsers =>
          prevUsers.map(u => ({
            ...u,
            isOnline: onlineUserIds.has(u.id)
          }))
        );
      };

      // Setup all listeners before subscribing
      channel
        .on('presence', { event: 'sync' }, handleSync)
        .on('presence', { event: 'join' }, handleSync)
        .on('presence', { event: 'leave' }, handleSync)
        .on("postgres_changes", { event: "*", schema: "public", table: "user_stats" }, fetchLeaderboard)
        .on("postgres_changes", { event: "*", schema: "public", table: "xp_logs" }, fetchLeaderboard)
        .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, fetchLeaderboard)
        .on("postgres_changes", { event: "*", schema: "public", table: "level_config" }, fetchLeaderboard);

      try {
        const status = await channel.subscribe();
        if (status === 'SUBSCRIBED' && mounted) {
          isSubscribedRef.current = true;
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error setting up channel:', error);
      }
    };

    setupChannel();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user?.id, fetchLeaderboard]);

  return { users, loading };
}

// Utility functions remain the same
export const logXPAction = async (
  userId: string,
  actionType: string,
  description?: string,
  relatedId?: string
): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('log_xp_action', {
      p_user_id: userId,
      p_action_type: actionType,
      p_description: description,
      p_related_id: relatedId
    });
    if (error) {
      console.error('Error logging XP action:', error);
      return 0;
    }
    console.log(`XP Action logged: ${actionType} +${data}XP for user ${userId}`);
    return data || 0;
  } catch (error) {
    console.error('Error calling log_xp_action:', error);
    return 0;
  }
};

export const recalculateUserStats = async (userId?: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('recalculate_user_stats', {
      target_user_id: userId || null
    });
    if (error) {
      console.error('Error recalculating user stats:', error);
      return;
    }
    console.log(`User stats recalculated for ${userId ? `user ${userId}` : 'all users'}`);
  } catch (error) {
    console.error('Error calling recalculate_user_stats:', error);
  }
};
