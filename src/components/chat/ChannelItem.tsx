
import React from 'react';
import { Hash, Volume2, Lock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  description: string;
  members?: number;
  messageCount?: number;
  icon?: string;
}

interface ChannelItemProps {
  channel: Channel;
  isSelected: boolean;
  onClick: () => void;
}

const getChannelIcon = (channelName: string) => {
  switch (channelName) {
    case 'general': return Hash;
    case 'ai-automation': return Zap;
    case 'frontend': return Hash;
    case 'backend': return Hash;
    case 'random': return Volume2;
    default: return Hash;
  }
};

const ChannelItem = ({ channel, isSelected, onClick }: ChannelItemProps) => {
  const IconComponent = getChannelIcon(channel.name);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full group flex items-center p-3 rounded-xl transition-all duration-300 text-left relative overflow-hidden",
        isSelected 
          ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border border-purple-500/40 neon-purple shadow-lg" 
          : "text-slate-300 hover:bg-white/5 hover:text-white hover:border-purple-500/20 border border-transparent"
      )}
    >
      {/* Background glow effect */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl blur-sm" />
      )}
      
      <div className="relative flex items-center w-full">
        <IconComponent className={cn(
          "w-5 h-5 mr-3 transition-colors flex-shrink-0",
          isSelected ? "text-purple-400" : "text-slate-400 group-hover:text-purple-400"
        )} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium font-inter truncate">{channel.name}</span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs ml-2",
                isSelected 
                  ? "border-purple-400/40 text-purple-300" 
                  : "border-slate-600 text-slate-400"
              )}
            >
              {channel.messageCount || 0}
            </Badge>
          </div>
          <div className="text-xs opacity-70 truncate font-inter">
            {channel.description}
          </div>
        </div>
        
        {isSelected && (
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full glow-pulse" />
        )}
      </div>
    </button>
  );
};

export default ChannelItem;
