
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useXPActions } from './useXPActions';

export const useDailyLogin = () => {
  const { user } = useAuth();
  const { logDailyLogin } = useXPActions();

  useEffect(() => {
    const checkDailyLogin = async () => {
      if (!user?.id) return;

      // Check if we've already logged today's login
      const lastLoginKey = `last_login_${user.id}`;
      const lastLogin = localStorage.getItem(lastLoginKey);
      const today = new Date().toDateString();

      if (lastLogin !== today) {
        try {
          await logDailyLogin(user.id);
          localStorage.setItem(lastLoginKey, today);
          console.log('Daily login XP awarded!');
        } catch (error) {
          console.error('Error logging daily login:', error);
        }
      }
    };

    // Small delay to ensure user is properly loaded
    const timer = setTimeout(checkDailyLogin, 1000);
    return () => clearTimeout(timer);
  }, [user, logDailyLogin]);
};
