
import React from 'react';
import { Hash, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ChannelItem from './ChannelItem';

interface Channel {
  id: string;
  name: string;
  description: string;
  members: number;
  icon?: string;
}

interface ChatSidebarProps {
  channels: Channel[];
  selectedChannel: string;
  onChannelSelect: (channelId: string) => void;
}

const ChatSidebar = ({ channels, selectedChannel, onChannelSelect }: ChatSidebarProps) => {
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
              {channels.reduce((sum, channel) => sum + channel.members, 0)}
            </Badge>
          </div>
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 neon-purple transition-all duration-300"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Channel
        </Button>
      </div>
      
      {/* Channels List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-3 font-space">
          Text Channels
        </div>
        
        {channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isSelected={selectedChannel === channel.id}
            onClick={() => onChannelSelect(channel.id)}
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
          <span className="text-sm text-slate-300">156 members active</span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
