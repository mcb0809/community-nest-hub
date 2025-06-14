
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reply, MoreHorizontal } from 'lucide-react';
import EmojiReactionRow from './EmojiReactionRow';
import ReplyTag from './ReplyTag';

interface Message {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: string;
  role: 'admin' | 'mod' | 'user';
  replyTo?: {
    user: string;
    message: string;
  };
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

interface MessageBubbleProps {
  message: Message;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
}

const getRoleConfig = (role: string) => {
  switch (role) {
    case 'admin': 
      return { 
        color: 'bg-red-500/20 text-red-300 border-red-500/40',
        glow: 'shadow-red-500/20'
      };
    case 'mod': 
      return { 
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        glow: 'shadow-yellow-500/20'
      };
    default: 
      return { 
        color: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
        glow: 'shadow-slate-500/20'
      };
  }
};

const MessageBubble = ({ message, onReply, onReact }: MessageBubbleProps) => {
  const roleConfig = getRoleConfig(message.role);

  return (
    <div className="group relative p-4 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-purple-500/20">
      {/* Reply indicator */}
      {message.replyTo && (
        <ReplyTag replyTo={message.replyTo} />
      )}
      
      <div className="flex space-x-3">
        <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-purple-500/30">
          <AvatarImage src={message.avatar} />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold">
            {message.user[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Message Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-white font-inter">
              {message.user}
            </span>
            <Badge 
              className={`${roleConfig.color} ${roleConfig.glow} shadow-lg`}
              variant="outline"
            >
              {message.role}
            </Badge>
            <span className="text-xs text-slate-500 font-inter">
              {message.timestamp}
            </span>
          </div>
          
          {/* Message Content */}
          <div className="text-slate-300 font-inter leading-relaxed mb-2">
            {message.message}
          </div>
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <EmojiReactionRow 
              reactions={message.reactions}
              onReact={(emoji) => onReact(message.id, emoji)}
            />
          )}
        </div>
        
        {/* Message Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20"
            onClick={() => onReact(message.id, '👍')}
          >
            👍
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20"
            onClick={() => onReply(message)}
          >
            <Reply className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
