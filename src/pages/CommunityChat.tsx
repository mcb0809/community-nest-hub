
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Hash, 
  Send, 
  Plus, 
  Search,
  MoreVertical,
  Pin,
  Smile,
  Paperclip,
  Users,
  Settings
} from 'lucide-react';

const CommunityChat = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [message, setMessage] = useState('');

  const channels = [
    { id: 'general', name: 'general', members: 156, unread: 0, type: 'text' },
    { id: 'announcements', name: 'announcements', members: 156, unread: 3, type: 'text' },
    { id: 'react-help', name: 'react-help', members: 89, unread: 7, type: 'text' },
    { id: 'nodejs-discussion', name: 'nodejs-discussion', members: 67, unread: 2, type: 'text' },
    { id: 'random', name: 'random', members: 134, unread: 12, type: 'text' },
    { id: 'resources', name: 'resources', members: 203, unread: 0, type: 'text' },
  ];

  const messages = [
    {
      id: 1,
      user: 'John Smith',
      avatar: 'JS',
      role: 'Admin',
      message: 'Welcome everyone to our community! Feel free to introduce yourselves.',
      timestamp: '10:30 AM',
      isPinned: true,
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      avatar: 'SJ',
      role: 'Moderator',
      message: 'Just finished the React course - amazing content! 🚀',
      timestamp: '11:15 AM',
      isPinned: false,
    },
    {
      id: 3,
      user: 'Mike Davis',
      avatar: 'MD',
      role: 'VIP',
      message: 'Has anyone tried the new Next.js 14 features? Would love to hear your thoughts.',
      timestamp: '11:45 AM',
      isPinned: false,
    },
    {
      id: 4,
      user: 'Emily Chen',
      avatar: 'EC',
      role: 'Member',
      message: '@Mike Davis Yes! The server actions are game-changing. I wrote a blog post about it.',
      timestamp: '12:05 PM',
      isPinned: false,
    },
    {
      id: 5,
      user: 'Alex Rodriguez',
      avatar: 'AR',
      role: 'Member',
      message: 'Quick question - what\'s the best way to handle state management in large React apps?',
      timestamp: '12:30 PM',
      isPinned: false,
    },
  ];

  const onlineMembers = [
    { name: 'John Smith', avatar: 'JS', status: 'online', role: 'Admin' },
    { name: 'Sarah Johnson', avatar: 'SJ', status: 'online', role: 'Moderator' },
    { name: 'Mike Davis', avatar: 'MD', status: 'away', role: 'VIP' },
    { name: 'Emily Chen', avatar: 'EC', status: 'online', role: 'Member' },
    { name: 'Alex Rodriguez', avatar: 'AR', status: 'online', role: 'Member' },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-500';
      case 'Moderator': return 'bg-blue-500';
      case 'VIP': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-lg">
      {/* Channels Sidebar */}
      <div className="w-64 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 dark:text-white">Channels</h2>
            <Button size="sm" variant="ghost">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input placeholder="Search channels..." className="pl-10 h-8 text-sm" />
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                  selectedChannel === channel.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium">{channel.name}</span>
                </div>
                {channel.unread > 0 && (
                  <Badge variant="destructive" className="h-5 text-xs">
                    {channel.unread}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <Hash className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {channels.find(c => c.id === selectedChannel)?.name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {channels.find(c => c.id === selectedChannel)?.members} members
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost">
              <Pin className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Users className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex space-x-3 ${msg.isPinned ? 'bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800' : ''}`}>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{msg.avatar}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white">{msg.user}</span>
                    <Badge size="sm" className={`${getRoleColor(msg.role)} text-white text-xs`}>
                      {msg.role}
                    </Badge>
                    <span className="text-xs text-slate-500">{msg.timestamp}</span>
                    {msg.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{msg.message}</p>
                </div>
                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                placeholder={`Message #${channels.find(c => c.id === selectedChannel)?.name}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Members Sidebar */}
      <div className="w-64 bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Online Members</h3>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {onlineMembers.map((member, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{member.avatar}</span>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-slate-800`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{member.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CommunityChat;
