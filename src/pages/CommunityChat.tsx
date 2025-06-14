
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Hash,
  Users,
  Settings,
  Search,
  Bell,
  LogOut,
  icons
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import EditChannelModal from '@/components/chat/EditChannelModal';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';

const CommunityChat = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const {
    channels,
    messages,
    selectedChannel,
    setSelectedChannel,
    loading: chatLoading,
    sendMessage,
    createChannel,
    updateChannelReaction,
    editChannel,
  } = useChat();

  const [replyTo, setReplyTo] = useState<{
    messageId: string;
    user: string;
    message: string;
  } | undefined>();

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || chatLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const currentChannel = channels.find(c => c.id === selectedChannel);

  const handleSendMessage = (message: string, replyToId?: string, attachments?: any[]) => {
    sendMessage(message, replyToId || replyTo?.messageId, attachments);
    setReplyTo(undefined);
  };

  const handleReply = (message: any) => {
    setReplyTo({
      messageId: message.id,
      user: message.user,
      message: message.message
    });
  };

  const handleReact = (messageId: string, emoji: string) => {
    updateChannelReaction(messageId, emoji);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleEditChannel = (data: { 
    id: string; 
    name: string; 
    description: string; 
    icon: string; 
    permissions: any 
  }) => {
    if(!editChannel) return;
    editChannel(data.id, data.name, data.description, data.icon);
    console.log('Channel permissions:', data.permissions); // For future implementation
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
      {/* Sidebar */}
      <ChatSidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onChannelSelect={setSelectedChannel}
        onCreateChannel={createChannel}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 glass-card border-b border-purple-500/20 flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              {currentChannel?.icon && (() => {
                const Icon = icons[currentChannel.icon as keyof typeof icons];
                return Icon ? <Icon className="w-4 h-4 text-white" /> : <Hash className="w-4 h-4 text-white" />;
              })()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-space">
                #{currentChannel?.name}
              </h3>
              <p className="text-xs text-purple-300">
                {currentChannel?.description}
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30">
              <Users className="w-3 h-3 mr-1" />
              {messages.length}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-300">{user?.email}</span>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/20">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/20">
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/20"
              onClick={() => setEditModalOpen(true)}
              aria-label="Edit channel"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Edit Channel Modal */}
        <EditChannelModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          initialData={currentChannel ? {
            id: currentChannel.id,
            name: currentChannel.name,
            description: currentChannel.description,
            icon: currentChannel.icon || "Hash",
            role: "user",
            isPublic: true,
          } : null}
          onSave={handleEditChannel}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={{
                  id: message.id,
                  user: message.user_profiles?.display_name || 'Unknown User',
                  avatar: message.user_profiles?.avatar_url || '/api/placeholder/32/32',
                  message: message.content,
                  timestamp: new Date(message.created_at).toLocaleTimeString([],
                    {
                      hour: '2-digit',
                      minute: '2-digit'
                    }),
                  role: (message.user_profiles?.role as 'admin' | 'mod' | 'user') || 'user',
                  replyTo: message.reply_message ? {
                    user: message.reply_message.user_profiles?.display_name || 'Unknown User',
                    message: message.reply_message.content
                  } : undefined,
                  reactions: Object.entries(message.reactions || {}).map(([emoji, users]) => ({
                    emoji,
                    count: (users as string[]).length,
                    users: users as string[]
                  })),
                  attachments: message.attachments || []
                }}
                onReply={handleReply}
                onReact={handleReact}
              />
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <ChatInput
          selectedChannel={currentChannel?.name || ''}
          onSendMessage={handleSendMessage}
          replyTo={replyTo ? {
            user: replyTo.user,
            message: replyTo.message
          } : undefined}
          onCancelReply={() => setReplyTo(undefined)}
        />
      </div>
    </div>
  );
};

export default CommunityChat;
