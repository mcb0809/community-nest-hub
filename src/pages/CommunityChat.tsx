
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Hash, 
  Send, 
  Smile, 
  Paperclip,
  Users,
  Settings,
  Search,
  Plus
} from 'lucide-react';

const CommunityChat = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [newMessage, setNewMessage] = useState('');

  const channels = [
    { id: 'general', name: 'general', description: 'General discussion', members: 156 },
    { id: 'frontend', name: 'frontend', description: 'Frontend development', members: 89 },
    { id: 'backend', name: 'backend', description: 'Backend development', members: 67 },
    { id: 'ai-automation', name: 'ai-automation', description: 'AI & Automation', members: 234 },
    { id: 'random', name: 'random', description: 'Random discussions', members: 45 },
  ];

  const messages = [
    {
      id: 1,
      user: 'John Smith',
      avatar: '/api/placeholder/32/32',
      message: 'Hey everyone! Just finished the React automation course. Amazing content!',
      timestamp: '2:30 PM',
      role: 'admin',
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      avatar: '/api/placeholder/32/32',
      message: 'Congratulations! How long did it take you to complete?',
      timestamp: '2:35 PM',
      role: 'vip',
    },
    {
      id: 3,
      user: 'Mike Davis',
      avatar: '/api/placeholder/32/32',
      message: 'I\'m working on the same course. The AI integration part is fascinating!',
      timestamp: '2:40 PM',
      role: 'member',
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'vip': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Channels Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Channels</h2>
          <Button size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Channel
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`w-full flex items-center p-3 rounded-lg mb-1 text-left transition-colors ${
                selectedChannel === channel.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{channel.name}</div>
                <div className="text-xs opacity-60 truncate">{channel.description}</div>
              </div>
              <Badge variant="secondary" className="text-xs ml-2">
                {channel.members}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
          <div className="flex items-center">
            <Hash className="w-5 h-5 text-slate-500 mr-2" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {channels.find(c => c.id === selectedChannel)?.name}
            </h3>
            <Badge variant="outline" className="ml-3">
              {channels.find(c => c.id === selectedChannel)?.members} members
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Users className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3 group hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-lg">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={message.avatar} />
                <AvatarFallback>{message.user[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {message.user}
                  </span>
                  <Badge className={getRoleColor(message.role)} variant="outline">
                    {message.role}
                  </Badge>
                  <span className="text-xs text-slate-500">{message.timestamp}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{message.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input 
                placeholder={`Message #${selectedChannel}`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
