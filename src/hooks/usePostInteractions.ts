
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useXPActions } from './useXPActions';

export interface PostComment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_profiles?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface PostInteraction {
  likes: number;
  comments: number;
  shares: number;
  userLiked: boolean;
  userShared: boolean;
}

export const usePostInteractions = (postId: string) => {
  const { user } = useAuth();
  const { logLike, logComment, logShare } = useXPActions();
  const [interaction, setInteraction] = useState<PostInteraction>({
    likes: 0,
    comments: 0,
    shares: 0,
    userLiked: false,
    userShared: false,
  });
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInteractions = async () => {
    if (!postId) return;

    try {
      // Fetch likes count
      const { count: likesCount } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      // Fetch comments count
      const { count: commentsCount } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      // Fetch shares count
      const { count: sharesCount } = await supabase
        .from('post_shares')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      let userLiked = false;
      let userShared = false;

      if (user?.id) {
        // Check if user liked this post
        const { data: userLike } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        userLiked = !!userLike;

        // Check if user shared this post
        const { data: userShare } = await supabase
          .from('post_shares')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        userShared = !!userShare;
      }

      setInteraction({
        likes: likesCount || 0,
        comments: commentsCount || 0,
        shares: sharesCount || 0,
        userLiked,
        userShared,
      });
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!postId) return;

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          user_profiles!inner(display_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const toggleLike = async () => {
    if (!user?.id) return;

    try {
      if (interaction.userLiked) {
        // Remove like
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Add like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        // Log XP for like
        await logLike(user.id, postId);
      }

      // Refresh interactions
      await fetchInteractions();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addComment = async (content: string) => {
    if (!user?.id || !content.trim()) return;

    try {
      await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
        });

      // Log XP for comment
      await logComment(user.id, postId);

      // Refresh comments and interactions
      await Promise.all([fetchComments(), fetchInteractions()]);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      // Refresh comments and interactions
      await Promise.all([fetchComments(), fetchInteractions()]);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleShare = async () => {
    if (!user?.id) return;

    try {
      if (interaction.userShared) {
        // Remove share
        await supabase
          .from('post_shares')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Add share
        await supabase
          .from('post_shares')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        // Log XP for share
        await logShare(user.id, postId);

        // Copy post link to clipboard
        const postUrl = `${window.location.origin}/community#post-${postId}`;
        await navigator.clipboard.writeText(postUrl);
      }

      // Refresh interactions
      await fetchInteractions();
    } catch (error) {
      console.error('Error toggling share:', error);
    }
  };

  useEffect(() => {
    fetchInteractions();
    fetchComments();
  }, [postId, user?.id]);

  return {
    interaction,
    comments,
    loading,
    toggleLike,
    addComment,
    deleteComment,
    toggleShare,
    refetch: () => Promise.all([fetchInteractions(), fetchComments()]),
  };
};
