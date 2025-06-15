
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LevelConfig {
  id: string;
  level_number: number;
  level_name: string;
  required_xp: number;
  color: string;
  icon: string;
}

export interface LevelInfo {
  level_number: number;
  level_name: string;
  color: string;
  icon: string;
  progress: number;
}

export const useLevelConfig = () => {
  const [levelConfigs, setLevelConfigs] = useState<LevelConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevelConfigs();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('level-config-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'level_config' },
        () => {
          console.log('Level config changed, refetching...');
          fetchLevelConfigs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLevelConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('level_config')
        .select('*')
        .order('level_number');

      if (error) throw error;
      setLevelConfigs(data || []);
    } catch (error) {
      console.error('Error fetching level configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelInfo = async (totalXp: number): Promise<LevelInfo | null> => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_level_from_config', { total_xp: totalXp });

      if (error) throw error;
      return data[0] || null;
    } catch (error) {
      console.error('Error calculating level:', error);
      return null;
    }
  };

  const getLevelByNumber = (levelNumber: number): LevelConfig | null => {
    return levelConfigs.find(config => config.level_number === levelNumber) || null;
  };

  return {
    levelConfigs,
    loading,
    getLevelInfo,
    getLevelByNumber,
    refetch: fetchLevelConfigs
  };
};
