
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
      // Use the new member_leaderboard view for optimized queries
      const { data, error } = await supabase
        .from("member_leaderboard")
        .select("*")
        .limit(100); // Limit for performance
      
      if (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
        return;
      }
      
      console.log("Raw leaderboard data:", data);
      
      const mapped: LeaderboardUser[] = (data || []).map((u: any) => {
        // Ensure all values are properly handled with fallbacks
        const totalXp = u.total_xp || 0;
        const level = u.level || 1;
        
        return {
          id: u.id,
          name: u.name || 'Anonymous',
          avatar: u.avatar,
          xp: totalXp,
          level: level,
          levelProgress: Math.max(0, Math.min(100, u.level_progress || 0)), // Ensure valid range
          coursesCompleted: u.courses_completed || 0,
          streak: u.streak_days || 0,
          badges: [], // Will be implemented with badge system later
          isOnline: u.is_online || false,
          joinDate: u.joined_at || new Date().toISOString(),
          title: undefined, // Can be set based on achievements later
          postsCount: u.posts_count || 0, // Map posts_count from database
        };
      });
      
      console.log("Mapped leaderboard users:", mapped);
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
    
    // Listen for realtime changes from user_stats table
    const channel = supabase
      .channel("realtime-leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_stats" },
        (payload) => {
          console.log("User stats changed:", payload);
          fetchLeaderboard(); // Refetch when user_stats changes
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "xp_logs" },
        (payload) => {
          console.log("XP logs changed:", payload);
          fetchLeaderboard(); // Refetch when new XP is logged
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          console.log("Posts changed:", payload);
          fetchLeaderboard(); // Refetch when posts change
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
