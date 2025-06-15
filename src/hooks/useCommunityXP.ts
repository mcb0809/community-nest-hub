
import { useXPActions } from './useXPActions';
import { useAuth } from './useAuth';

export const useCommunityXP = () => {
  const { user } = useAuth();
  const { logLike, logComment, logShare, logWritePost } = useXPActions();

  const handleLike = async (postId: string) => {
    if (!user?.id) return;
    
    try {
      const xpEarned = await logLike(user.id, postId);
      console.log(`Like action logged! XP earned: ${xpEarned}`);
      return xpEarned;
    } catch (error) {
      console.error('Error logging like XP:', error);
      return 0;
    }
  };

  const handleComment = async (postId: string) => {
    if (!user?.id) return;
    
    try {
      const xpEarned = await logComment(user.id, postId);
      console.log(`Comment action logged! XP earned: ${xpEarned}`);
      return xpEarned;
    } catch (error) {
      console.error('Error logging comment XP:', error);
      return 0;
    }
  };

  const handleShare = async (postId: string) => {
    if (!user?.id) return;
    
    try {
      const xpEarned = await logShare(user.id, postId);
      console.log(`Share action logged! XP earned: ${xpEarned}`);
      return xpEarned;
    } catch (error) {
      console.error('Error logging share XP:', error);
      return 0;
    }
  };

  const handleWritePost = async (postId: string) => {
    if (!user?.id) return;
    
    try {
      const xpEarned = await logWritePost(user.id, postId);
      console.log(`Write post action logged! XP earned: ${xpEarned}`);
      return xpEarned;
    } catch (error) {
      console.error('Error logging write post XP:', error);
      return 0;
    }
  };

  return {
    handleLike,
    handleComment,
    handleShare,
    handleWritePost,
  };
};
