
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useOnlineTracking = () => {
  const { user } = useAuth();
  const sessionStartRef = useRef<Date | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const presenceChannelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    // Start tracking session
    sessionStartRef.current = new Date();
    
    // Update last activity immediately
    updateLastActivity();

    // Set up heartbeat to update activity every 5 minutes
    heartbeatIntervalRef.current = setInterval(updateLastActivity, 5 * 60 * 1000);

    // Handle daily login check
    handleDailyLogin();

    // Set up presence channel for online tracking
    presenceChannelRef.current = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'user_id',
        },
      },
    });

    presenceChannelRef.current.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        // Track user presence
        await presenceChannelRef.current.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    });

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User went away - log session time and untrack presence
        logSessionTime();
        if (presenceChannelRef.current) {
          presenceChannelRef.current.untrack();
        }
      } else {
        // User came back - restart session and track presence again
        sessionStartRef.current = new Date();
        updateLastActivity();
        if (presenceChannelRef.current) {
          presenceChannelRef.current.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      logSessionTime();
      if (presenceChannelRef.current) {
        presenceChannelRef.current.untrack();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Cleanup
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Log final session time and untrack presence
      logSessionTime();
      if (presenceChannelRef.current) {
        presenceChannelRef.current.untrack();
        supabase.removeChannel(presenceChannelRef.current);
      }
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
