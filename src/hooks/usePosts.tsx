
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PostAttachment {
  id: string;
  post_id: string;
  type: 'file' | 'asset' | 'collection';
  name: string;
  url: string;
  meta: any;
  uploaded_at: string;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  tags: string[];
  user_id?: string;
  visibility: 'public' | 'vip' | 'draft';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  attachments?: PostAttachment[];
  user_profiles?: {
    display_name: string;
    avatar_url?: string;
  };
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async (filters?: { tags?: string[], visibility?: string, search?: string }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select(`
          *,
          user_profiles!posts_user_id_fkey (
            display_name,
            avatar_url
          ),
          post_attachments (*)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const typedData = (data || []).map(post => ({
        ...post,
        tags: post.tags || [],
        attachments: post.post_attachments || []
      })) as Post[];
      
      setPosts(typedData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'is_pinned'>) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          ...postData,
          user_id: user?.id,
          is_pinned: false
        }])
        .select(`
          *,
          user_profiles!posts_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        tags: data.tags || [],
        attachments: []
      } as Post;
      
      setPosts(prev => [typedData, ...prev]);
      return typedData;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const updatePost = async (id: string, postData: Partial<Post>) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          ...postData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          user_profiles!posts_user_id_fkey (
            display_name,
            avatar_url
          ),
          post_attachments (*)
        `)
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        tags: data.tags || [],
        attachments: data.post_attachments || []
      } as Post;
      
      setPosts(prev => prev.map(post => post.id === id ? typedData : post));
      return typedData;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const deletePost = async (id: string) => {
    try {
      // Delete attachments from storage first
      const { data: attachments } = await supabase
        .from('post_attachments')
        .select('url')
        .eq('post_id', id);

      if (attachments && attachments.length > 0) {
        const filePaths = attachments.map(att => {
          const url = att.url;
          const fileName = url.split('/').pop();
          return `${user?.id}/${fileName}`;
        }).filter(Boolean);

        if (filePaths.length > 0) {
          await supabase.storage
            .from('post-attachments')
            .remove(filePaths);
        }
      }

      // Delete post (attachments will be deleted by cascade)
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    return updatePost(id, { is_pinned: isPinned });
  };

  const uploadAttachment = async (postId: string, file: File, type: 'file' | 'asset' | 'collection') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-attachments')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('post_attachments')
        .insert([{
          post_id: postId,
          type,
          name: file.name,
          url: publicUrl,
          meta: {
            size: file.size,
            type: file.type
          }
        }])
        .select()
        .single();

      if (error) throw error;

      return data as PostAttachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    togglePin,
    uploadAttachment,
    refetch: fetchPosts
  };
};
