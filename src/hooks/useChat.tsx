import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Channel, Message } from '@/types';
import { useXPActions } from './useXPActions';

export interface UnreadCounts {
  [channelId: string]: number;
}

export const useChat = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});
  const { user, isAdmin } = useAuth();
  
  const { logChatMessage } = useXPActions();

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setChannels(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!selectedChannel) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, user_profiles:user_id(display_name, avatar_url, role), reply_message:reply_to(*, user_profiles(display_name))')
        .eq('channel_id', selectedChannel)
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setMessages(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedChannel]);

  const sendMessage = async (
    content: string, 
    replyToId?: string, 
    attachments?: any[]
  ) => {
    if (!user?.id || !selectedChannel) return;

    try {
      const { data: messageData, error } = await supabase
        .from('messages')
        .insert({
          content,
          channel_id: selectedChannel,
          user_id: user.id,
          reply_to: replyToId || null,
        })
        .select('*')
        .single();

      if (error) throw error;

      // Log XP for sending a message - this will update the database
      await logChatMessage(user.id, messageData.id);

      // Handle attachments if any
      if (attachments && attachments.length > 0) {
        await Promise.all(
          attachments.map(async (attachment) => {
            const { error: attachmentError } = await supabase
              .from('message_attachments')
              .insert({
                message_id: messageData.id,
                file_name: attachment.name,
                file_url: attachment.url,
                file_type: attachment.type,
                file_size: attachment.size || 0,
              });

            if (attachmentError) {
              console.error('Error saving attachment:', attachmentError);
            }
          })
        );
      }

      // Refresh messages to show the new one
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createChannel = async (name: string, description: string, icon: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          name,
          description,
          icon,
          created_by: user.id,
        })
        .select('*')
        .single();

      if (error) throw error;

      await fetchChannels();
      setSelectedChannel(data.id);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const editChannel = async (id: string, name: string, description: string, icon: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('channels')
        .update({
          name,
          description,
          icon,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      await fetchChannels();
      setSelectedChannel(data.id);
    } catch (error) {
      console.error('Error updating channel:', error);
    }
  };

  const updateChannelReaction = async (messageId: string, emoji: string) => {
    if (!user?.id) return;

    try {
      // Fetch the existing reactions for the message
      const { data: existingReactions, error: fetchError } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();

      if (fetchError) {
        console.error('Error fetching existing reactions:', fetchError);
        return;
      }

      // Parse existing reactions or initialize an empty object
      const reactions = existingReactions?.reactions || {};

      // Check if the user has already reacted with this emoji
      if (reactions[emoji] && (reactions[emoji] as string[]).includes(user.id)) {
        // Remove the user's ID from the emoji's array
        reactions[emoji] = (reactions[emoji] as string[]).filter(userId => userId !== user.id);

        // If the emoji array is empty after removing the user, remove the emoji
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      } else {
        // Add the user's ID to the emoji's array
        reactions[emoji] = [...(reactions[emoji] || []), user.id];
      }

      // Update the reactions in the database
      const { error: updateError } = await supabase
        .from('messages')
        .update({ reactions })
        .eq('id', messageId);

      if (updateError) {
        console.error('Error updating reactions:', updateError);
      } else {
        // Optimistically update the local state
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === messageId ? { ...msg, reactions } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error updating channel reaction:', error);
    }
  };

  const calculateUnreadCounts = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch the last read timestamps for each channel
      const { data: lastReadData, error: lastReadError } = await supabase
        .from('user_channel_reads')
        .select('channel_id, last_read_at')
        .eq('user_id', user.id);

      if (lastReadError) {
        console.error('Error fetching last read timestamps:', lastReadError);
        return;
      }

      const lastReadByChannel: { [channelId: string]: string } = {};
      lastReadData.forEach(item => {
        lastReadByChannel[item.channel_id] = item.last_read_at;
      });

      // Calculate unread counts for each channel
      const unreadCountsByChannel: UnreadCounts = {};
      for (const channel of channels) {
        const lastReadAt = lastReadByChannel[channel.id];

        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact' })
          .eq('channel_id', channel.id)
          .gt('created_at', lastReadAt || new Date(0).toISOString()); // Messages after last read

        if (countError) {
          console.error('Error fetching unread message count:', countError);
          continue;
        }

        unreadCountsByChannel[channel.id] = count || 0;
      }

      setUnreadCounts(unreadCountsByChannel);
    } catch (error) {
      console.error('Error calculating unread counts:', error);
    }
  }, [user, channels]);

  // Call this function when a user reads a channel
  const markChannelAsRead = async (channelId: string) => {
    if (!user?.id) return;

    try {
      // Update or insert the last read timestamp for the user and channel
      const { error } = await supabase
        .from('user_channel_reads')
        .upsert(
          {
            user_id: user.id,
            channel_id: channelId,
            last_read_at: new Date().toISOString(),
          },
          { onConflict: ['user_id', 'channel_id'] }
        );

      if (error) {
        console.error('Error marking channel as read:', error);
      } else {
        // Optimistically update the local state
        setUnreadCounts(prevUnreadCounts => ({
          ...prevUnreadCounts,
          [channelId]: 0,
        }));
      }
    } catch (error) {
      console.error('Error marking channel as read:', error);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    calculateUnreadCounts();
  }, [calculateUnreadCounts]);

  useEffect(() => {
    if (selectedChannel) {
      markChannelAsRead(selectedChannel);
    }
  }, [selectedChannel, markChannelAsRead]);

  useEffect(() => {
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('Message received!', payload);
          fetchMessages();
          calculateUnreadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, calculateUnreadCounts]);

  return {
    channels,
    messages,
    selectedChannel,
    setSelectedChannel,
    loading,
    error,
    sendMessage,
    createChannel,
    updateChannelReaction,
    editChannel,
    unreadCounts,
  };
};
