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

export function useSimpleLeaderboard() {
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
      const { data: profilesData, error: profilesError } = await supabase
        .from("user_profiles")
        .select(`id, display_name, avatar_url, email, created_at`);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setUsers([]);
        return;
      }

      const {Data } = await supabase.from("user_stats").select("*");
      const {tsData } = await supabase.from("posts").select("user_id").eq("visibility", "public");

      const postsCounts: Record<string, number> = {};
      if (postsData) {
        postsData.forEach(post => {
          if (post.user_id) {
            postsCounts[post.user_id] = (postsCounts[post.user_id] || 0) + 1;
          }
        });
      }

      const mapped = (profilesData || []).map((profile: any) => {
        const userStats = statsData?.find(s => s.user_id === profile.id);
        const totalXp = userStats?.total_xp || 0;
        const level = userStats?.level || 1;
        const levelConfig = getLevelByNumber(level);

        return {
          id: profile.id,
          name: profile.display_name || 'Anonymous',
          avatar: profile.avatar_url,
          xp: totalXp,
          level: level,
          levelProgress: calculateLevelProgress(totalXp, level, levelConfigs, getLevelByNumber),
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
        const onlineStatusMap = new Map<string, boolean>();
        currentUsers.forEach(u => {
          if (u.isOnline) {
            onlineStatusMap.set(u.id, true);
          }
        });
        return mapped.map(newUser => ({
          ...newUser,
          isOnline: onlineStatusMap.has(newUser.id),
        }));
      });
    } catch (error) {
      console.error('Error in fetchLeaderboard:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [levelConfigs, getLevelByNumber]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (!user?.id) return;

    const setupRealtimeSubscription = async () => {
      try {
        // Cleanup existing subscription
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
          isSubscribedRef.current = false;
        }

        const channel = supabase.channel(`leaderboard-${user.id}`);
        channelRef.current = channel;

        const handleSync = () => {
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

        channel
          .on('presence', { event: 'sync' }, handleSync)
          .on('presence', { event: 'join' }, handleSync)
          .on('presence', { event: 'leave' }, handleSync)
          .on("postgres_changes", { event: "*", schema: "public", table: "user_stats" }, fetchLeaderboard)
          .on("postgres_changes", { event: "*", schema: "public", table: "xp_logs" }, fetchLeaderboard)
          .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, fetchLeaderboard)
          .on("postgres_changes", { event: "*", schema: "public", table: "level_config" }, fetchLeaderboard);

        const status = await channel.subscribe();

        if (status !== 'SUBSCRIBED') {
          throw new Error('Failed to subscribe to channel');
        }

        isSubscribedRef.current = true;
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user?.id, fetchLeaderboard]);

  return { users, loading };
}

// Utility function to calculate level progress
const calculateLevelProgress = (
  xp: number, 
  currentLevel: number, 
  levelConfigs: any[], 
  getLevelByNumber: (level: number) => any
) => {
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
