
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Channel {
  id: string;
  name: string;
  description: string | null;
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
  } | null;
  reply_message?: {
    content: string;
    user_profiles: {
      display_name: string;
    } | null;
  } | null;
}

export const useChat = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load channels
  useEffect(() => {
    loadChannels();
  }, []);

  // Load messages when channel changes
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel);
    }
  }, [selectedChannel]);

  // Set up realtime subscriptions
  useEffect(() => {
    const channelsSubscription = supabase
      .channel('channels-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, () => {
        loadChannels();
      })
      .subscribe();

    const messagesSubscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          loadMessages(selectedChannel);
        } else if (payload.eventType === 'UPDATE') {
          loadMessages(selectedChannel);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelsSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  }, [selectedChannel]);

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
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          user_profiles!inner (display_name, avatar_url, role),
          reply_message:reply_to (
            content,
            user_profiles!inner (display_name)
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our Message interface
      const transformedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        reactions: typeof msg.reactions === 'object' && msg.reactions !== null 
          ? msg.reactions as Record<string, string[]>
          : {}
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

  const sendMessage = async (content: string, replyTo?: string) => {
    if (!user || !selectedChannel) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: selectedChannel,
          user_id: user.id,
          content,
          reply_to: replyTo || null,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const createChannel = async (name: string, description: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('channels')
        .insert({
          name,
          description,
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
      // Get current message
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
        // Remove user's reaction
        newReactions = {
          ...currentReactions,
          [emoji]: userReactions.filter((id: string) => id !== user.id)
        };
        // Remove emoji if no reactions left
        if (newReactions[emoji].length === 0) {
          delete newReactions[emoji];
        }
      } else {
        // Add user's reaction
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

  return {
    channels,
    messages,
    selectedChannel,
    setSelectedChannel,
    loading,
    sendMessage,
    createChannel,
    updateChannelReaction,
  };
};
