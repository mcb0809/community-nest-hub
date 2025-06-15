
import React from 'react';
import { Hash, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ChannelItem from './ChannelItem';
import CreateChannelModal from './CreateChannelModal';
import { Channel, Message } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface ChatSidebarProps {
  channels: Channel[];
  selectedChannel: string;
  messages: Message[];
  unreadCounts: Record<string, number>;
  onChannelSelect: (channelId: string) => void;
  onCreateChannel: (name: string, description: string, icon: string) => void;
}

const ChatSidebar = ({ channels, selectedChannel, messages, unreadCounts, onChannelSelect, onCreateChannel }: ChatSidebarProps) => {
  const { isAdmin } = useAuth();
  const { isAuthenticated, requireAuth } = useAuthGuard();

  const handleChannelClick = (channelId: string) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    onChannelSelect(channelId);
  };

  return (
    <div className="w-80 glass-card border-r border-purple-500/20 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-space gradient-web3-text">
            Community Chat
          </h2>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-purple-400" />
            <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30">
              {channels.length}
            </Badge>
          </div>
        </div>
        
        {/* Only show Create Channel button for admin users */}
        {isAdmin() && (
          <CreateChannelModal onCreateChannel={onCreateChannel} />
        )}
      </div>
      
      {/* Channels List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-3 font-space">
          Text Channels
        </div>
        
        {channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={{
              id: channel.id,
              name: channel.name,
              description: channel.description || '',
              unreadCount: unreadCounts[channel.id] || 0
            }}
            isSelected={selectedChannel === channel.id}
            onClick={() => handleChannelClick(channel.id)}
          />
        ))}
      </div>

      {/* Footer - Online Users */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-2 font-space">
          Online Now
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-300">Active community</span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
