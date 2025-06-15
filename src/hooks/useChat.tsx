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

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url, role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!selectedChannel) return;

    setLoading(true);
    try {
      // First fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', selectedChannel)
        .order('created_at', { ascending: true });

      if (messagesError) {
        setError(messagesError.message);
        return;
      }

      // Then fetch user profiles for all unique user IDs
      const userIds = [...new Set((messagesData || []).map(msg => msg.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url, role')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
      }

      // Create a map of user profiles
      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Transform the data to match our Message type
      const transformedMessages: Message[] = (messagesData || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        channel_id: msg.channel_id,
        user_id: msg.user_id,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        reactions: msg.reactions || {},
        reply_to: msg.reply_to,
        user_profiles: profilesMap[msg.user_id] || null,
        reply_message: null, // We'll handle replies separately if needed
        attachments: []
      }));

      setMessages(transformedMessages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedChannel]);

  const addNewMessage = useCallback(async (newMessageData: any) => {
    // Fetch user profile for the new message
    const userProfile = await fetchUserProfile(newMessageData.user_id);
    
    const newMessage: Message = {
      id: newMessageData.id,
      content: newMessageData.content,
      channel_id: newMessageData.channel_id,
      user_id: newMessageData.user_id,
      created_at: newMessageData.created_at,
      updated_at: newMessageData.updated_at,
      reactions: newMessageData.reactions || {},
      reply_to: newMessageData.reply_to,
      user_profiles: userProfile,
      reply_message: null,
      attachments: []
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
  }, [fetchUserProfile]);

  const sendMessage = async (
    content: string, 
    replyToId?: string, 
    attachments?: any[]
  ) => {
    if (!user?.id || !selectedChannel) return;

    try {
      console.log('Sending message and logging XP...');
      
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

      console.log('Message sent successfully:', messageData);

      // Log XP for sending a message - await this to ensure it completes
      try {
        const xpEarned = await logChatMessage(user.id, messageData.id);
        console.log('XP logged for chat message:', xpEarned);
      } catch (xpError) {
        console.error('Error logging XP for chat message:', xpError);
      }

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

      // Add the new message to local state with user profile
      await addNewMessage(messageData);
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
            msg.id === messageId ? { ...msg, reactions: reactions as Record<string, string[]> } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error updating channel reaction:', error);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedChannel) return;

    const channel = supabase
      .channel(`messages-${selectedChannel}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${selectedChannel}`
        },
        async (payload) => {
          console.log('New message received!', payload);
          // Only add the message if it's not from the current user (to avoid duplicates)
          if (payload.new.user_id !== user?.id) {
            await addNewMessage(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages',
          filter: `channel_id=eq.${selectedChannel}`
        },
        (payload) => {
          console.log('Message updated!', payload);
          // Update the message in local state (for reactions, etc.)
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === payload.new.id 
                ? { ...msg, reactions: payload.new.reactions || {} }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChannel, user?.id, addNewMessage]);

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
