
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useOnlineTracking = () => {
  const { user } = useAuth();
  const sessionStartRef = useRef<Date | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    console.log('Starting online tracking for user:', user.id);

    // Start tracking session
    sessionStartRef.current = new Date();
    
    // Update last activity immediately
    updateLastActivity();

    // Set up heartbeat to update activity every 5 minutes
    heartbeatIntervalRef.current = setInterval(updateLastActivity, 5 * 60 * 1000);

    // Handle daily login check
    handleDailyLogin();

    return () => {
      console.log('Cleaning up online tracking');
      // Cleanup
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      // Log final session time
      logSessionTime();
    };
  }, [user]);

  const updateLastActivity = async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  };

  const logSessionTime = async () => {
    if (!user || !sessionStartRef.current) return;

    const sessionEnd = new Date();
    const sessionDurationMs = sessionEnd.getTime() - sessionStartRef.current.getTime();
    const sessionHours = sessionDurationMs / (1000 * 60 * 60);

    // Only log if session was at least 5 minutes
    if (sessionHours >= (5 / 60)) {
      try {
        await supabase.rpc('log_online_time', {
          user_id_param: user.id,
          hours_online: sessionHours
        });
      } catch (error) {
        console.error('Error logging online time:', error);
      }
    }

    // Reset session start
    sessionStartRef.current = new Date();
  };

  const handleDailyLogin = async () => {
    if (!user) return;

    try {
      await supabase.rpc('handle_daily_login', {
        user_id_param: user.id
      });
    } catch (error) {
      console.error('Error handling daily login:', error);
    }
  };
};
