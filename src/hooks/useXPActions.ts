
import { useCallback } from 'react';
import { logXPAction } from './useLeaderboardRealtime';
import { useToast } from './use-toast';

export const useXPActions = () => {
  const { toast } = useToast();

  const logLike = useCallback(async (userId: string, postId?: string) => {
    const xp = await logXPAction(userId, 'like', 'Liked a post', postId);
    if (xp > 0) {
      toast({
        title: "XP Earned!",
        description: `+${xp} XP for liking a post`,
      });
    }
    return xp;
  }, [toast]);

  const logComment = useCallback(async (userId: string, postId?: string) => {
    const xp = await logXPAction(userId, 'comment', 'Commented on a post', postId);
    if (xp > 0) {
      toast({
        title: "XP Earned!",
        description: `+${xp} XP for commenting`,
      });
    }
    return xp;
  }, [toast]);

  const logShare = useCallback(async (userId: string, postId?: string) => {
    const xp = await logXPAction(userId, 'share', 'Shared a post', postId);
    if (xp > 0) {
      toast({
        title: "XP Earned!",
        description: `+${xp} XP for sharing a post`,
      });
    }
    return xp;
  }, [toast]);

  const logCourseComplete = useCallback(async (userId: string, courseId?: string) => {
    const xp = await logXPAction(userId, 'complete_course', 'Completed a course', courseId);
    if (xp > 0) {
      toast({
        title: "Course Completed!",
        description: `+${xp} XP for completing a course`,
      });
    }
    return xp;
  }, [toast]);

  const logWritePost = useCallback(async (userId: string, postId?: string) => {
    const xp = await logXPAction(userId, 'write_post', 'Created a new post', postId);
    if (xp > 0) {
      toast({
        title: "Post Created!",
        description: `+${xp} XP for writing a post`,
      });
    }
    return xp;
  }, [toast]);

  const logDailyLogin = useCallback(async (userId: string) => {
    const xp = await logXPAction(userId, 'daily_login', 'Daily login streak');
    if (xp > 0) {
      toast({
        title: "Daily Login Bonus!",
        description: `+${xp} XP for logging in today`,
      });
    }
    return xp;
  }, [toast]);

  const logOnlineTime = useCallback(async (userId: string, hours: number) => {
    const xp = await logXPAction(userId, 'hourly_online', `Online for ${hours.toFixed(2)} hours`);
    return xp;
  }, []);

  const logChatMessage = useCallback(async (userId: string, messageId?: string) => {
    try {
      console.log('🎯 Logging chat message XP for user:', userId, 'message:', messageId);
      const xp = await logXPAction(userId, 'send_message', 'Sent a chat message', messageId);
      console.log('✅ Chat message XP logged successfully:', xp);
      
      // Always show toast for chat messages to confirm XP was earned
      if (xp > 0) {
        toast({
          title: "Message sent! 💬",
          description: `+${xp} XP earned`,
          duration: 2000,
        });
      } else {
        console.warn('⚠️ No XP earned for chat message');
      }
      return xp;
    } catch (error) {
      console.error('❌ Error logging chat message XP:', error);
      return 0;
    }
  }, [toast]);

  return {
    logLike,
    logComment,
    logShare,
    logCourseComplete,
    logWritePost,
    logDailyLogin,
    logOnlineTime,
    logChatMessage,
  };
};
