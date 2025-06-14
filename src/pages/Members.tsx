
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Filter,
  Mail,
  Calendar,
  Award,
  MessageCircle,
  MoreVertical
} from 'lucide-react';

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const roles = [
    { id: 'all', name: 'All Members', count: 234 },
    { id: 'admin', name: 'Admins', count: 3 },
    { id: 'moderator', name: 'Moderators', count: 8 },
    { id: 'vip', name: 'VIP Members', count: 45 },
    { id: 'member', name: 'Members', count: 178 },
  ];

  const members = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      role: 'admin',
      avatar: 'JS',
      joinDate: '2023-01-15',
      lastActive: '2024-06-14',
      coursesCompleted: 12,
      totalCourses: 15,
      messagesSent: 1456,
      eventsAttended: 8,
      status: 'online',
      badges: ['Founder', 'Course Creator', 'Community Leader'],
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'moderator',
      avatar: 'SJ',
      joinDate: '2023-02-20',
      lastActive: '2024-06-14',
      coursesCompleted: 8,
      totalCourses: 12,
      messagesSent: 892,
      eventsAttended: 15,
      status: 'online',
      badges: ['Moderator', 'Event Organizer'],
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike.davis@email.com',
      role: 'vip',
      avatar: 'MD',
      joinDate: '2023-03-10',
      lastActive: '2024-06-13',
      coursesCompleted: 18,
      totalCourses: 20,
      messagesSent: 654,
      eventsAttended: 12,
      status: 'away',
      badges: ['VIP', 'Course Completionist', 'Top Contributor'],
    },
    {
      id: 4,
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      role: 'member',
      avatar: 'EC',
      joinDate: '2023-05-18',
      lastActive: '2024-06-14',
      coursesCompleted: 6,
      totalCourses: 10,
      messagesSent: 324,
      eventsAttended: 5,
      status: 'online',
      badges: ['Active Learner'],
    },
    {
      id: 5,
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@email.com',
      role: 'member',
      avatar: 'AR',
      joinDate: '2023-08-22',
      lastActive: '2024-06-12',
      coursesCompleted: 3,
      totalCourses: 8,
      messagesSent: 156,
      eventsAttended: 2,
      status: 'offline',
      badges: ['Newcomer'],
    },
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'vip': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Community Members</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and connect with your community</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Mail className="w-4 h-4 mr-2" />
          Invite Members
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {roles.slice(0, 4).map((role) => (
          <Card key={role.id} className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{role.count}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{role.name}</p>
                </div>
                <Users className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search members..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-800"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{member.avatar}</span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-slate-800`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{member.email}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className={getRoleColor(member.role)}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Badge>
                <span className="text-xs text-slate-500 capitalize">{member.status}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Member Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="font-semibold text-slate-900 dark:text-white">{member.coursesCompleted}/{member.totalCourses}</p>
                  <p className="text-slate-600 dark:text-slate-400">Courses</p>
                </div>
                <div className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="font-semibold text-slate-900 dark:text-white">{member.eventsAttended}</p>
                  <p className="text-slate-600 dark:text-slate-400">Events</p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {member.messagesSent} messages
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {new Date(member.joinDate).toLocaleDateString()}
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Badges</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {member.badges.map((badge, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No members found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default Members;
