
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
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();
  const { logChatMessage } = useXPActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!channelId && !selectedChannel) return;
    const targetChannelId = channelId || selectedChannel;
    setLoading(true);
    try {
      // Fetch messages and user profiles separately to avoid relationship issues
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', targetChannelId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch user profiles separately
      const userIds = [...new Set(messagesData?.map(msg => msg.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url, email')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Could not fetch user profiles:', profilesError);
      }

      // Fetch attachments separately
      const messageIds = messagesData?.map(msg => msg.id) || [];
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('message_attachments')
        .select('*')
        .in('message_id', messageIds);

      if (attachmentsError) {
        console.warn('Could not fetch attachments:', attachmentsError);
      }

      // Combine data
      const transformedMessages: Message[] = (messagesData || []).map((msg: any) => {
        const userProfile = profilesData?.find(p => p.id === msg.user_id);
        const attachments = attachmentsData?.filter(att => att.message_id === msg.id) || [];
        
        return {
          ...msg,
          reactions: msg.reactions || {},
          user_profiles: userProfile ? {
            display_name: userProfile.display_name,
            avatar_url: userProfile.avatar_url,
            email: userProfile.email
          } : undefined,
          message_attachments: attachments
        };
      });
      
      setMessages(transformedMessages);
      console.log('Messages fetched successfully:', transformedMessages.length);
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
      
      // Set first channel as selected if none selected
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0].id);
      }
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
    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel || channelId) {
      fetchMessages();

      const targetChannelId = channelId || selectedChannel;
      const messageChannel = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages', filter: `channel_id=eq.${targetChannelId}` },
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
    }
  }, [channelId, selectedChannel]);

  const sendMessage = async (content: string, replyTo?: string, attachments?: File[]) => {
    if (!user || (!channelId && !selectedChannel) || !content.trim()) return;

    const targetChannelId = channelId || selectedChannel;
    setSending(true);
    try {
      // Send message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          content: content.trim(),
          user_id: user.id,
          channel_id: targetChannelId,
          reply_to: replyTo || null
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      console.log('Message sent, logging XP for user:', user.id);
      
      // Log XP for sending message - ensure this actually works
      try {
        const xpEarned = await logChatMessage(user.id, messageData.id);
        console.log('XP logged successfully:', xpEarned);
      } catch (xpError) {
        console.error('Error logging XP:', xpError);
      }

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
      const targetMessage = messages.find(m => m.id === messageId);
      if (targetMessage) {
        const currentReactions = targetMessage.reactions || {};
        const newReactions = { ...currentReactions };
        
        if (newReactions[reaction] && newReactions[reaction].includes(user.id)) {
          newReactions[reaction] = newReactions[reaction].filter(userId => userId !== user.id);
        } else {
          newReactions[reaction] = [...(newReactions[reaction] || []), user.id];
        }

        const { error } = await supabase
          .from('messages')
          .update({ reactions: newReactions })
          .eq('id', messageId);

        if (error) throw error;
      }
      
      await fetchMessages();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const createChannel = async (name: string, description: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert([{
          name,
          description,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchChannels();
      setSelectedChannel(data.id);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const editChannel = async (channelId: string, name: string, description: string, icon: string) => {
    try {
      const { error } = await supabase
        .from('channels')
        .update({ name, description, icon })
        .eq('id', channelId);

      if (error) throw error;
      await fetchChannels();
    } catch (error) {
      console.error('Error editing channel:', error);
    }
  };

  const updateChannelReaction = addReaction; // Alias for compatibility

  return {
    messages,
    channels,
    selectedChannel,
    setSelectedChannel,
    loading,
    sending,
    sendMessage,
    updateMessage,
    deleteMessage,
    addReaction,
    createChannel,
    editChannel,
    updateChannelReaction,
    unreadCounts,
    messagesEndRef
  };
};
