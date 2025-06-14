
import React, { useState } from 'react';
import { 
  Hash, 
  Users,
  Settings,
  Search,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';

interface Message {
  id: number;
  user: string;
  avatar: string;
  message: string;
  timestamp: string;
  role: 'admin' | 'vip' | 'member';
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

const CommunityChat = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [replyTo, setReplyTo] = useState<{user: string; message: string} | undefined>();

  const channels = [
    { id: 'general', name: 'general', description: 'General discussion', members: 156 },
    { id: 'frontend', name: 'frontend', description: 'Frontend development', members: 89 },
    { id: 'backend', name: 'backend', description: 'Backend development', members: 67 },
    { id: 'ai-automation', name: 'ai-automation', description: 'AI & Automation', members: 234 },
    { id: 'random', name: 'random', description: 'Random discussions', members: 45 },
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      user: 'John Smith',
      avatar: '/api/placeholder/32/32',
      message: 'Hey everyone! Just finished the React automation course. Amazing content! 🚀',
      timestamp: '2:30 PM',
      role: 'admin',
      reactions: [
        { emoji: '👍', count: 5, users: ['Alice', 'Bob'] },
        { emoji: '🚀', count: 2, users: ['Charlie'] }
      ]
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      avatar: '/api/placeholder/32/32',
      message: 'Congratulations! How long did it take you to complete?',
      timestamp: '2:35 PM',
      role: 'vip',
      replyTo: {
        user: 'John Smith',
        message: 'Hey everyone! Just finished the React automation course...'
      }
    },
    {
      id: 3,
      user: 'Mike Davis',
      avatar: '/api/placeholder/32/32',
      message: 'I\'m working on the same course. The AI integration part is fascinating! Anyone has tips for the advanced modules?',
      timestamp: '2:40 PM',
      role: 'member',
      reactions: [
        { emoji: '💯', count: 3, users: ['Sarah', 'Alex'] }
      ]
    },
  ]);

  const currentChannel = channels.find(c => c.id === selectedChannel);

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      user: 'AI Learner',
      avatar: '/api/placeholder/32/32',
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'member',
      replyTo: replyTo ? replyTo : undefined
    };
    
    setMessages([...messages, newMessage]);
    setReplyTo(undefined);
  };

  const handleReply = (message: Message) => {
    setReplyTo({
      user: message.user,
      message: message.message
    });
  };

  const handleReact = (messageId: number, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions?.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, users: [...r.users, 'You'] }
                : r
            )
          };
        } else {
          return {
            ...msg,
            reactions: [
              ...(msg.reactions || []),
              { emoji, count: 1, users: ['You'] }
            ]
          };
        }
      }
      return msg;
    }));
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900">
      {/* Sidebar */}
      <ChatSidebar 
        channels={channels}
        selectedChannel={selectedChannel}
        onChannelSelect={setSelectedChannel}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 glass-card border-b border-purple-500/20 flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Hash className="w-4 h-4 text-white" />
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
              {currentChannel?.members}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/20">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/20">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/20">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onReply={handleReply}
                onReact={handleReact}
              />
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <ChatInput
          selectedChannel={selectedChannel}
          onSendMessage={handleSendMessage}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(undefined)}
        />
      </div>
    </div>
  );
};

export default CommunityChat;
