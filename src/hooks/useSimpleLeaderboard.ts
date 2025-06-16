
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLevelConfig } from "./useLevelConfig";

export interface SimpleLeaderboardUser {
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
  const [users, setUsers] = useState<SimpleLeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { levelConfigs, getLevelByNumber } = useLevelConfig();

  useEffect(() => {
    const fetchData = async () => {
      if (levelConfigs.length === 0) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching simple leaderboard...');
        
        // Try to use the member_leaderboard view first
        const { data: viewData, error: viewError } = await supabase
          .from("member_leaderboard")
          .select("*")
          .order("total_xp", { ascending: false });

        if (!viewError && viewData) {
          const mapped = viewData.map((member: any) => {
            const levelConfig = getLevelByNumber(member.level || 1);
            
            return {
              id: member.id,
              name: member.name || 'Anonymous',
              avatar: member.avatar,
              xp: member.total_xp || 0,
              level: member.level || 1,
              levelProgress: member.level_progress || 0,
              coursesCompleted: member.courses_completed || 0,
              streak: member.streak_days || 0,
              badges: [],
              isOnline: false, // Will be updated by presence if needed
              joinDate: member.joined_at || new Date().toISOString(),
              title: undefined,
              postsCount: member.posts_count || 0,
              levelName: levelConfig?.level_name,
              levelColor: levelConfig?.color,
              levelIcon: levelConfig?.icon,
            };
          });

          setUsers(mapped);
        } else {
          // Fallback to basic user_profiles
          const { data: profiles, error } = await supabase
            .from("user_profiles")
            .select("id, display_name, avatar_url, email, created_at")
            .order("created_at", { ascending: false });

          if (error) throw error;

          const mapped = (profiles || []).map((profile: any) => {
            const levelConfig = getLevelByNumber(1);
            
            return {
              id: profile.id,
              name: profile.display_name || 'Anonymous',
              avatar: profile.avatar_url,
              xp: 0,
              level: 1,
              levelProgress: 0,
              coursesCompleted: 0,
              streak: 0,
              badges: [],
              isOnline: false,
              joinDate: profile.created_at || new Date().toISOString(),
              title: undefined,
              postsCount: 0,
              levelName: levelConfig?.level_name,
              levelColor: levelConfig?.color,
              levelIcon: levelConfig?.icon,
            };
          });

          setUsers(mapped);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [levelConfigs, getLevelByNumber]);

  return { users, loading };
}
