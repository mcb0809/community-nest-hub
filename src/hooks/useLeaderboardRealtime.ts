
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
}

const levelThresholds = [1000, 1500, 2000, 2800, 4000, 6000, 8500, 12000, 18000];

function getLevel(xp: number) {
  let acc = 0;
  for (let i = 0; i < levelThresholds.length; i++) {
    acc += levelThresholds[i];
    if (xp < acc) {
      return {
        level: i + 1,
        progress: Math.round((xp - (acc - levelThresholds[i])) * 100 / levelThresholds[i]),
        maxXp: acc,
      };
    }
  }
  return { level: 10, progress: 100, maxXp: acc };
}

export function useLeaderboardRealtime() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeaderboard() {
    // Join user_profiles and user_stats, rank by total_xp desc
    const { data, error } = await supabase
      .from("user_profiles")
      .select(`
        id,
        display_name,
        avatar_url,
        created_at,
        user_stats: user_stats (
          total_xp,
          courses_completed,
          current_streak,
          last_activity,
          longest_streak
        )
      `)
      .order("user_stats.total_xp", { ascending: false });
    if (error) {
      setLoading(false);
      return;
    }
    const mapped: LeaderboardUser[] = (data || []).map((u: any) => {
      const xp = u.user_stats?.total_xp || 0;
      const levelData = getLevel(xp);
      return {
        id: u.id,
        name: u.display_name,
        avatar: u.avatar_url,
        xp,
        level: levelData.level,
        levelProgress: levelData.progress,
        coursesCompleted: u.user_stats?.courses_completed || 0,
        streak: u.user_stats?.current_streak || 0,
        // Cần badge, isOnline, joinDate lấy từ các nguồn thích hợp:
        badges: [],
        isOnline: !!(
          u.user_stats &&
          u.user_stats.last_activity &&
          new Date().getTime() - new Date(u.user_stats.last_activity).getTime() < 30 * 60 * 1000
        ),
        joinDate: u.created_at,
      };
    });
    setUsers(mapped);
    setLoading(false);
  }

  useEffect(() => {
    fetchLeaderboard();
    // Lắng nghe realtime changes từ user_stats
    const channel = supabase
      .channel("realtime-user_stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_stats" },
        fetchLeaderboard
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { users, loading };
}
