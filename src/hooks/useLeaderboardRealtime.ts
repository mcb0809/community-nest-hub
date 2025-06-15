import { useEffect, useState } from "react";
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

  async function fetchLeaderboard() {
    console.log("Fetching leaderboard data...");
    
    try {
      // Get user profiles data
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
        console.error("Error fetching user profiles:", profilesError);
        setLoading(false);
        return;
      }

      console.log("User profiles data:", profilesData);

      // Get user stats separately
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("*");

      if (statsError) {
        console.warn("Error fetching user stats:", statsError);
      }

      console.log("User stats data:", statsData);

      // Get posts count for each user
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("user_id")
        .eq("visibility", "public");

      if (postsError) {
        console.warn("Error fetching posts:", postsError);
      }

      // Count posts by user
      const postsCounts: Record<string, number> = {};
      if (postsData) {
        postsData.forEach(post => {
          if (post.user_id) {
            postsCounts[post.user_id] = (postsCounts[post.user_id] || 0) + 1;
          }
        });
      }

      console.log("Posts counts:", postsCounts);

      // Combine all data with level information
      const mapped: LeaderboardUser[] = (profilesData || []).map((profile: any) => {
        const userStats = statsData?.find(s => s.user_id === profile.id);
        const totalXp = userStats?.total_xp || 0;
        const level = userStats?.level || 1;
        
        // Get level config for this level
        const levelConfig = getLevelByNumber(level);
        
        // Calculate level progress using level configs
        const calculateLevelProgress = (xp: number, currentLevel: number) => {
          if (!levelConfigs.length) return 0;
          
          const currentLevelConfig = getLevelByNumber(currentLevel);
          const nextLevelConfig = getLevelByNumber(currentLevel + 1);
          
          if (!currentLevelConfig) return 0;
          if (!nextLevelConfig) return 100; // Max level reached
          
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
          coursesCompleted: userStats?.courses_completed || 0,
          streak: userStats?.current_streak || 0,
          badges: [], // Will be implemented with badge system later
          isOnline: onlineUsers.has(profile.id), // Check if user is in online users set
          joinDate: profile.created_at || new Date().toISOString(),
          title: undefined, // Can be set based on achievements later
          postsCount: postsCounts[profile.id] || 0,
          levelName: levelConfig?.level_name,
          levelColor: levelConfig?.color,
          levelIcon: levelConfig?.icon,
        };
      });

      // Sort by XP descending
      mapped.sort((a, b) => b.xp - a.xp);
      
      console.log("Final mapped leaderboard users:", mapped);
      setUsers(mapped);
      setLoading(false);
    } catch (error) {
      console.error("Unexpected error fetching leaderboard:", error);
      setUsers([]);
      setLoading(false);
    }
  }

  useEffect(() => {
    // Only fetch if level configs are loaded
    if (levelConfigs.length > 0) {
      fetchLeaderboard();
    }
  }, [levelConfigs, onlineUsers.size]);

  useEffect(() => {
    fetchLeaderboard();
    
    // Set up a single presence channel for tracking online users and current user presence
    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'user_id',
        },
      },
    });

    // Listen for presence sync events
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        console.log('Presence sync:', state);
        
        // Extract user IDs from presence state
        const onlineUserIds = new Set<string>();
        Object.keys(state).forEach(key => {
          const presences = state[key];
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              onlineUserIds.add(presence.user_id);
            }
          });
        });
        
        console.log('Online users:', onlineUserIds);
        setOnlineUsers(onlineUserIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence if authenticated
          if (user) {
            console.log('Tracking user presence:', user.id);
            await presenceChannel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    // Set up data changes channel
    const dataChannel = supabase
      .channel("realtime-leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_stats" },
        (payload) => {
          console.log("User stats changed:", payload);
          fetchLeaderboard();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "xp_logs" },
        (payload) => {
          console.log("XP logs changed:", payload);
          fetchLeaderboard();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          console.log("Posts changed:", payload);
          fetchLeaderboard();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "level_config" },
        (payload) => {
          console.log("Level config changed:", payload);
          fetchLeaderboard();
        }
      )
      .subscribe();

    // Handle page visibility changes for presence tracking
    const handleVisibilityChange = () => {
      if (user) {
        if (document.hidden) {
          console.log('Page hidden, untracking presence');
          presenceChannel.untrack();
        } else {
          console.log('Page visible, tracking presence');
          presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      if (user) {
        console.log('Page unloading, untracking presence');
        presenceChannel.untrack();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      console.log('Cleaning up channels and event listeners');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Untrack presence before removing channels
      if (user) {
        presenceChannel.untrack();
      }
      
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(dataChannel);
    };
  }, [user?.id]); // Only re-run when user ID changes

  // Re-fetch when online users change
  useEffect(() => {
    if (users.length > 0) {
      fetchLeaderboard();
    }
  }, [onlineUsers.size]);

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
