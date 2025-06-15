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

  // Ref lưu channel instance để tránh tạo lại
  const channelRef = useRef<any>(null);

  // Hàm fetchLeaderboard không phụ thuộc onlineUsers, truyền vào nếu cần
  const fetchLeaderboard = useCallback(
    async (currentOnlineUsers?: Set<string>) => {
      const onlineSet = currentOnlineUsers || onlineUsers; // fallback
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
    [levelConfigs, getLevelByNumber, onlineUsers] // onlineUsers trong deps chỉ để tránh stale state, thực tế luôn fetch realtime theo presence event
  );

  // Cleanup channel đúng chuẩn
  const cleanupChannel = useCallback(() => {
    if (channelRef.current) {
      try {
        channelRef.current.untrack?.();
        supabase.removeChannel(channelRef.current);
      } catch {}
      channelRef.current = null;
    }
  }, []);

  // Main effect: tạo và cleanup channel duy nhất khi user id hoặc levelConfigs đủ dữ liệu.
  useEffect(() => {
    // Điều kiện tạo channel realtime leaderboard
    if (!user?.id || !levelConfigs.length) return;

    // CLEANUP TRƯỚC khi tạo mới (fix triệt để double subscribe)
    cleanupChannel();

    // Tạo channel mới
    const channelId = `leaderboard-realtime-${user.id}`;
    const channel = supabase.channel(channelId, { config: { presence: { key: 'user_id' } } });
    channelRef.current = channel;

    fetchLeaderboard(); // Fetch lần đầu

    // Đăng ký presence
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
        fetchLeaderboard(onlineUserIds); // update bảng realtime
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

    // CHỈ subscribe duy nhất 1 lần cho channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString()
        });
      }
    });

    // Cleanup khi component unmount hoặc deps thay đổi
    return () => {
      cleanupChannel();
    };
  }, [user?.id, levelConfigs.length, fetchLeaderboard, cleanupChannel]);

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
