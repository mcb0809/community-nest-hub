import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useXPActions } from './useXPActions';

export interface Message {
  id: string;
  content: string;
  user_id: string;
  channel_id: string;
  created_at: string;
  updated_at?: string;
  reactions?: Record<string, string[]>;
  reply_to?: string;
  user_profiles?: {
    display_name: string;
    avatar_url?: string;
  };
  message_attachments?: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
  }>;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export const useChat = (channelId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { logChatMessage } = useXPActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!channelId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          user_profiles (display_name, avatar_url),
          message_attachments (*)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    fetchMessages();
    fetchChannels();

    const messageChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          console.log('Change received!', payload)
          fetchMessages();
          scrollToBottom();
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
    }
  }, [channelId]);

  const sendMessage = async (content: string, replyTo?: string, attachments?: File[]) => {
    if (!user || !channelId || !content.trim()) return;

    setSending(true);
    try {
      // Send message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          content: content.trim(),
          user_id: user.id,
          channel_id: channelId,
          reply_to: replyTo || null
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      // Log XP for sending message
      await logChatMessage(user.id, messageData.id);

      // Handle file attachments if any
      if (attachments && attachments.length > 0) {
        const uploadPromises = attachments.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('message-attachments')
            .getPublicUrl(filePath);

          return supabase
            .from('message_attachments')
            .insert([{
              message_id: messageData.id,
              file_name: file.name,
              file_url: publicUrl,
              file_type: file.type,
              file_size: file.size
            }]);
        });

        await Promise.all(uploadPromises);
      }

      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const updateMessage = async (messageId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ content })
        .eq('id', messageId)
        .single();

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const addReaction = async (messageId: string, reaction: string) => {
    if (!user) return;

    try {
      // Optimistically update the local state
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            const newReactions = { ...msg.reactions };
            if (newReactions && newReactions[reaction]) {
              if (newReactions[reaction]!.includes(user.id)) {
                newReactions[reaction] = newReactions[reaction]!.filter(userId => userId !== user.id);
              } else {
                newReactions[reaction] = [...newReactions[reaction]!, user.id];
              }
            } else {
              newReactions[reaction] = [user.id];
            }
            return { ...msg, reactions: newReactions };
          }
          return msg;
        });
      });

      // Update the database
      const { error } = await supabase.rpc('add_reaction', {
        message_id: messageId,
        reaction_type: reaction,
        user_id: user.id
      });

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  return {
    messages,
    channels,
    loading,
    sending,
    sendMessage,
    updateMessage,
    deleteMessage,
    addReaction,
    messagesEndRef
  };
};
