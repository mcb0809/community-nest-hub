import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  reactions: Record<string, string[]>;
  reply_to: string | null;
  created_at: string;
  updated_at: string;
  user_profiles: {
    display_name: string;
    avatar_url: string | null;
    role: string;
    email?: string;
  } | null;
  reply_message?: {
    content: string;
    user_profiles: {
      display_name: string;
    } | null;
  } | null;
  attachments: any[];
  is_read?: boolean;
}

export const useChat = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  // Load channels
  useEffect(() => {
    loadChannels();
  }, []);

  // Enhanced channel switching - clear messages immediately and mark as read
  useEffect(() => {
    if (selectedChannel) {
      setMessages([]); // Clear immediately for smooth transition
      loadMessages(selectedChannel);
      markChannelAsRead(selectedChannel);
    }
  }, [selectedChannel]);

  // Enhanced realtime subscriptions
  useEffect(() => {
    if (!selectedChannel) return;

    const realtimeChannel = supabase.channel(`messages:${selectedChannel}`);

    // Real-time message events
    realtimeChannel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${selectedChannel}` },
        (payload) => {
          console.log('New message received:', payload);
          const newMsgData = payload.new;
          
          // Skip if this is our own message (already added optimistically)
          if (newMsgData.user_id === user?.id) {
            return;
          }
          
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsgData.id)) return prev;
            
            // Add message immediately with basic data
            const newMessage: Message = {
              id: newMsgData.id,
              channel_id: newMsgData.channel_id || '',
              user_id: newMsgData.user_id || '',
              content: newMsgData.content,
              reactions: typeof newMsgData.reactions === 'object' && newMsgData.reactions !== null ? newMsgData.reactions : {},
              reply_to: newMsgData.reply_to,
              created_at: newMsgData.created_at || '',
              updated_at: newMsgData.updated_at || '',
              user_profiles: null,
              reply_message: null,
              attachments: [],
              is_read: false
            };
            
            const updated = [...prev, newMessage];
            // Hydrate profiles in background
            hydrateMessageProfiles([newMessage]);
            
            // Update unread count for other channels
            if (newMsgData.channel_id !== selectedChannel) {
              setUnreadCounts(prev => ({
                ...prev,
                [newMsgData.channel_id]: (prev[newMsgData.channel_id] || 0) + 1
              }));
            }
            
            return updated;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${selectedChannel}` },
        (payload) => {
          console.log('Message updated:', payload);
          const updatedMsg = payload.new;
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMsg.id 
              ? {
                  ...msg,
                  content: updatedMsg.content,
                  reactions: typeof updatedMsg.reactions === 'object' && updatedMsg.reactions !== null ? updatedMsg.reactions : {},
                  updated_at: updatedMsg.updated_at || msg.updated_at
                }
              : msg
          ));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${selectedChannel}` },
        (payload) => {
          console.log('Message deleted:', payload);
          const deletedMsg = payload.old;
          setMessages(prev => prev.filter(msg => msg.id !== deletedMsg.id));
        }
      )
      .subscribe();

    // Channel metadata changes - listen for real-time updates
    const channelsRealtime = supabase
      .channel('channels-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'channels' }, (payload) => {
        console.log('Channel updated:', payload);
        const updatedChannel = payload.new;
        setChannels(prev => prev.map(channel => 
          channel.id === updatedChannel.id 
            ? { ...channel, ...updatedChannel }
            : channel
        ));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'channels' }, () => {
        loadChannels();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'channels' }, () => {
        loadChannels();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
      supabase.removeChannel(channelsRealtime);
    };
  }, [selectedChannel, user?.id]);

  // Load unread counts for all channels
  useEffect(() => {
    if (user) {
      loadUnreadCounts();
    }
  }, [user]);

  const loadUnreadCounts = async () => {
    if (!user) return;
    
    try {
      // This is a simplified approach - in production you'd want a proper read_status table
      const { data: channelsData } = await supabase
        .from('channels')
        .select('id');
      
      if (channelsData) {
        const counts: Record<string, number> = {};
        // For now, we'll use a simple approach - you can enhance this later
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };

  const markChannelAsRead = (channelId: string) => {
    setUnreadCounts(prev => ({
      ...prev,
      [channelId]: 0
    }));
  };

  // Helper function to hydrate message profiles
  const hydrateMessageProfiles = async (messagesToHydrate: Message[]) => {
    try {
      const userIds = [...new Set(messagesToHydrate.map(msg => msg.user_id).filter(Boolean))];
      const replyMessageIds = [...new Set(messagesToHydrate.map(msg => msg.reply_to).filter(Boolean))];

      // Fetch user profiles
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url, role, email')
        .in('id', userIds);

      // Fetch reply messages
      let replyMessagesData: any[] = [];
      if (replyMessageIds.length > 0) {
        const { data: replyData } = await supabase
          .from('messages')
          .select('id, content, user_id')
          .in('id', replyMessageIds);
        replyMessagesData = replyData || [];
      }

      // Create maps
      const profilesMap = new Map();
      (profilesData || []).forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      const replyMessagesMap = new Map();
      replyMessagesData.forEach(reply => {
        const profile = profilesMap.get(reply.user_id);
        replyMessagesMap.set(reply.id, {
          content: reply.content,
          user_profiles: profile ? { display_name: profile.display_name } : null
        });
      });

      // Update messages with profile data
      setMessages(prev => prev.map(msg => {
        if (messagesToHydrate.some(m => m.id === msg.id)) {
          return {
            ...msg,
            user_profiles: profilesMap.get(msg.user_id) || null,
            reply_message: msg.reply_to ? replyMessagesMap.get(msg.reply_to) : null
          };
        }
        return msg;
      }));
    } catch (error) {
      console.error('Error hydrating profiles:', error);
    }
  };

  const loadChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setChannels(data || []);
      if (data && data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0].id);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          message_attachments (
            id,
            file_name,
            file_type,
            file_size,
            file_url
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      // Get user IDs and reply message IDs
      const userIds = [...new Set(messagesData.map(msg => msg.user_id).filter(Boolean))];
      const replyMessageIds = [...new Set(messagesData.map(msg => msg.reply_to).filter(Boolean))];

      // Fetch user profiles
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url, role, email')
        .in('id', userIds);

      // Fetch reply messages
      let replyMessagesData: any[] = [];
      if (replyMessageIds.length > 0) {
        const { data: replyData } = await supabase
          .from('messages')
          .select('id, content, user_id')
          .in('id', replyMessageIds);
        replyMessagesData = replyData || [];
      }

      // Create maps
      const profilesMap = new Map();
      (profilesData || []).forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      const replyMessagesMap = new Map();
      replyMessagesData.forEach(reply => {
        const profile = profilesMap.get(reply.user_id);
        replyMessagesMap.set(reply.id, {
          content: reply.content,
          user_profiles: profile ? { display_name: profile.display_name } : null
        });
      });

      // Transform messages
      const transformedMessages: Message[] = messagesData.map(msg => ({
        id: msg.id,
        channel_id: msg.channel_id || '',
        user_id: msg.user_id || '',
        content: msg.content,
        reactions: typeof msg.reactions === 'object' && msg.reactions !== null 
          ? msg.reactions as Record<string, string[]>
          : {},
        reply_to: msg.reply_to,
        created_at: msg.created_at || '',
        updated_at: msg.updated_at || '',
        user_profiles: profilesMap.get(msg.user_id) || null,
        reply_message: msg.reply_to ? replyMessagesMap.get(msg.reply_to) : null,
        attachments: msg.message_attachments || [],
        is_read: true
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (content: string, replyTo?: string, attachments?: any[]) => {
    if (!user || !selectedChannel) return;

    // Create optimistic message immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      channel_id: selectedChannel,
      user_id: user.id,
      content,
      reactions: {},
      reply_to: replyTo || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_profiles: {
        display_name: userProfile?.display_name || user.email?.split('@')[0] || 'Unknown User',
        avatar_url: userProfile?.avatar_url || null,
        role: userProfile?.role || 'user',
        email: user.email || undefined
      },
      reply_message: null,
      attachments: attachments || [],
      is_read: true
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          channel_id: selectedChannel,
          user_id: user.id,
          content,
          reply_to: replyTo || null,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...optimisticMessage, id: messageData.id }
          : msg
      ));

      // Add attachments if any
      if (attachments && attachments.length > 0) {
        const attachmentInserts = attachments.map(attachment => ({
          message_id: messageData.id,
          file_name: attachment.file_name,
          file_type: attachment.file_type,
          file_size: attachment.file_size,
          file_url: attachment.file_url
        }));

        const { error: attachmentError } = await supabase
          .from('message_attachments')
          .insert(attachmentInserts);

        if (attachmentError) {
          console.error('Error saving attachments:', attachmentError);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const createChannel = async (name: string, description: string, icon: string = 'Hash') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('channels')
        .insert({
          name,
          description,
          icon,
          created_by: user.id,
        });

      if (error) throw error;
      toast({
        title: "Success",
        description: "Channel created successfully",
      });
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      });
    }
  };

  const updateChannelReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      const currentReactions = (message.reactions as Record<string, string[]>) || {};
      const userReactions = currentReactions[emoji] || [];
      
      let newReactions: Record<string, string[]>;
      if (userReactions.includes(user.id)) {
        newReactions = {
          ...currentReactions,
          [emoji]: userReactions.filter((id: string) => id !== user.id)
        };
        if (newReactions[emoji].length === 0) {
          delete newReactions[emoji];
        }
      } else {
        newReactions = {
          ...currentReactions,
          [emoji]: [...userReactions, user.id]
        };
      }

      const { error } = await supabase
        .from('messages')
        .update({ reactions: newReactions })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    }
  };

  const editChannel = async (channelId: string, name: string, description: string, icon: string) => {
    try {
      const { error } = await supabase
        .from('channels')
        .update({
          name,
          description,
          icon,
          updated_at: new Date().toISOString(),
        })
        .eq('id', channelId);

      if (error) throw error;
      
      // Update local state immediately for better UX
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, name, description, icon, updated_at: new Date().toISOString() }
          : channel
      ));
      
      toast({
        title: "Success",
        description: "Channel updated successfully",
      });
    } catch (error) {
      console.error('Error editing channel:', error);
      toast({
        title: "Error",
        description: "Failed to update channel",
        variant: "destructive",
      });
    }
  };

  return {
    channels,
    messages,
    selectedChannel,
    setSelectedChannel,
    loading,
    sendMessage,
    createChannel,
    updateChannelReaction,
    editChannel,
    unreadCounts,
  };
};
