import { useEffect, useState, useRef, useCallback } from "react";
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
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { levelConfigs, getLevelByNumber } = useLevelConfig();

  // Ref để giữ instance channel
  const channelRef = useRef<any>(null);

  // FETCH leaderboard (offline to prevent infinite effect loops)
  const fetchLeaderboard = useCallback(
    async (customOnlineUsers?: Set<string>) => {
      // Use given set or last snapshot from ref
      const onlineSet = customOnlineUsers || onlineUsers;
      setLoading(true);

      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from("user_profiles")
          .select(`
            id,
            display_name,
            avatar_url,
            email,
            created_at
          `);

        if (profilesError) {
          setLoading(false);
          return;
        }

        const { data: statsData } = await supabase
          .from("user_stats")
          .select("*");

        const { data: postsData } = await supabase
          .from("posts")
          .select("user_id")
          .eq("visibility", "public");

        const postsCounts: Record<string, number> = {};
        if (postsData) {
          postsData.forEach(post => {
            if (post.user_id) {
              postsCounts[post.user_id] = (postsCounts[post.user_id] || 0) + 1;
            }
          });
        }

        const mapped: LeaderboardUser[] = (profilesData || []).map((profile: any) => {
          const userStats = statsData?.find(s => s.user_id === profile.id);
          const totalXp = userStats?.total_xp || 0;
          const level = userStats?.level || 1;
          const levelConfig = getLevelByNumber(level);

          // Level progress từ config
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
            isOnline: onlineSet.has(profile.id),
            joinDate: profile.created_at || new Date().toISOString(),
            title: undefined,
            postsCount: postsCounts[profile.id] || 0,
            levelName: levelConfig?.level_name,
            levelColor: levelConfig?.color,
            levelIcon: levelConfig?.icon,
          };
        });

        mapped.sort((a, b) => b.xp - a.xp);

        setUsers(mapped);
        setLoading(false);
      } catch (error) {
        setUsers([]);
        setLoading(false);
      }
    },
    [levelConfigs, getLevelByNumber] // NO onlineUsers here! Prevent loop!
  );

  // Proper channel cleanup
  const cleanupChannel = useCallback(() => {
    if (channelRef.current) {
      try {
        channelRef.current.untrack?.();
        supabase.removeChannel(channelRef.current);
      } catch {}
      channelRef.current = null;
    }
  }, []);

  // Only create one channel for this user + this config
  useEffect(() => {
    // Guard: don't setup if no user or no configs
    if (!user?.id || !levelConfigs.length) return;

    // Always CLEANUP old channel FIRST
    cleanupChannel();

    // Create new channel each time when needed, never two at once
    const channelId = `leaderboard-realtime-${user.id}`;
    const channel = supabase.channel(channelId, { config: { presence: { key: 'user_id' } } });
    channelRef.current = channel;

    fetchLeaderboard(); // Load initial

    // Listen to presence and changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUserIds = new Set<string>();
        Object.keys(state).forEach(key => {
          const presences = state[key];
          presences.forEach((presence: any) => {
            if (presence.user_id) onlineUserIds.add(presence.user_id);
          });
        });
        setOnlineUsers(onlineUserIds);
        fetchLeaderboard(onlineUserIds); // Keep chart up-to-date
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "user_stats" }, () => {
        fetchLeaderboard();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "xp_logs" }, () => {
        fetchLeaderboard();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetchLeaderboard();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "level_config" }, () => {
        fetchLeaderboard();
      });

    // Only subscribe once per channel instance!
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString()
        });
      }
    });

    // Completely cleanup on change/unmount
    return () => {
      cleanupChannel();
    };
    // ONLY depend on user.id and levelConfigs!
  }, [user?.id, levelConfigs, cleanupChannel, fetchLeaderboard]);

  return { users, loading };
}

// Utility function to log XP actions
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

// Utility function to recalculate user stats
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
