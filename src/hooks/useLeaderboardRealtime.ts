
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
}

export function useLeaderboardRealtime() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeaderboard() {
    console.log("Fetching leaderboard data...");
    
    try {
      // First try to get data from user_profiles with basic stats
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

      // Combine all data
      const mapped: LeaderboardUser[] = (profilesData || []).map((profile: any) => {
        const userStats = statsData?.find(s => s.user_id === profile.id);
        const totalXp = userStats?.total_xp || 0;
        const level = userStats?.level || 1;
        
        // Simple level progress calculation to avoid database function issues
        const calculateSimpleLevelProgress = (xp: number, currentLevel: number) => {
          const levelThresholds = [1000, 1500, 2000, 2800, 4000, 6000, 8500, 12000, 18000, 25000];
          
          if (currentLevel <= 0 || currentLevel > levelThresholds.length) {
            return 0;
          }
          
          let accumulatedXp = 0;
          for (let i = 0; i < currentLevel - 1; i++) {
            accumulatedXp += levelThresholds[i] || 0;
          }
          
          const currentLevelThreshold = levelThresholds[currentLevel - 1] || 1000;
          const progressXp = Math.max(0, xp - accumulatedXp);
          const progress = Math.min(100, Math.max(0, Math.round((progressXp / currentLevelThreshold) * 100)));
          
          return progress;
        };

        return {
          id: profile.id,
          name: profile.display_name || 'Anonymous',
          avatar: profile.avatar_url,
          xp: totalXp,
          level: level,
          levelProgress: calculateSimpleLevelProgress(totalXp, level),
          coursesCompleted: userStats?.courses_completed || 0,
          streak: userStats?.current_streak || 0,
          badges: [], // Will be implemented with badge system later
          isOnline: false, // Will be implemented with real-time presence later
          joinDate: profile.created_at || new Date().toISOString(),
          title: undefined, // Can be set based on achievements later
          postsCount: postsCounts[profile.id] || 0,
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
    fetchLeaderboard();
    
    // Listen for realtime changes
    const channel = supabase
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
