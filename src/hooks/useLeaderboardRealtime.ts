
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
  
  // Single subscription reference to prevent multiple subscriptions
  const subscriptionRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  // Stable fetchLeaderboard function that doesn't depend on onlineUsers
  const fetchLeaderboard = useCallback(async (currentOnlineUsers?: Set<string>) => {
    console.log("Fetching leaderboard data...");
    
    // Use the passed onlineUsers or current state
    const onlineUsersToUse = currentOnlineUsers || onlineUsers;
    
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
          isOnline: onlineUsersToUse.has(profile.id), // Use the passed online users
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
  }, [levelConfigs, getLevelByNumber]); // Remove onlineUsers from dependencies

  // Cleanup function
  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      console.log("Cleaning up existing subscription");
      try {
        subscriptionRef.current.untrack?.();
        supabase.removeChannel(subscriptionRef.current);
      } catch (error) {
        console.warn('Error during subscription cleanup:', error);
      }
      subscriptionRef.current = null;
      isSubscribedRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Only setup subscription once when user and level configs are available
    if (!user?.id || !levelConfigs.length || isSubscribedRef.current) {
      return;
    }

    console.log("Setting up leaderboard subscription for user:", user.id);

    // Clean up any existing subscription first
    cleanupSubscription();
    
    // Initial fetch
    fetchLeaderboard();
    
    // Create unique channel
    const channelId = `leaderboard-realtime-${user.id}-${Date.now()}`;
    console.log("Creating channel:", channelId);
    
    const channel = supabase.channel(channelId, {
      config: { presence: { key: 'user_id' } }
    });

    subscriptionRef.current = channel;

    // Set up channel subscriptions
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUserIds = new Set<string>();
        Object.keys(state).forEach(key => {
          const presences = state[key];
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              onlineUserIds.add(presence.user_id);
            }
          });
        });
        setOnlineUsers(onlineUserIds);
        // Re-fetch with updated online users
        fetchLeaderboard(onlineUserIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
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
      })
      .subscribe(async (status) => {
        console.log('Channel subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          // Track user presence
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          isSubscribedRef.current = false;
        }
      });

    // Cleanup on unmount
    return () => {
      cleanupSubscription();
    };
  }, [user?.id, levelConfigs.length, fetchLeaderboard, cleanupSubscription]); // Include stable dependencies

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
