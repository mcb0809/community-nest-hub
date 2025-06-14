
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  MessageCircle, 
  Calendar, 
  FileText, 
  Users, 
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { name: 'Active Courses', value: '12', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { name: 'Messages Today', value: '148', icon: MessageCircle, color: 'from-green-500 to-green-600' },
    { name: 'Upcoming Events', value: '5', icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { name: 'Documents', value: '89', icon: FileText, color: 'from-orange-500 to-orange-600' },
  ];

  const recentActivity = [
    { type: 'course', title: 'Completed "React Advanced Patterns"', time: '2 hours ago', user: 'John Doe' },
    { type: 'event', title: 'Registered for "Next.js Workshop"', time: '4 hours ago', user: 'Jane Smith' },
    { type: 'chat', title: 'New message in #general', time: '6 hours ago', user: 'Mike Johnson' },
    { type: 'document', title: 'Downloaded "API Documentation"', time: '1 day ago', user: 'Sarah Wilson' },
  ];

  const courseProgress = [
    { name: 'React Fundamentals', progress: 85, lessons: 12, completed: 10 },
    { name: 'Node.js Backend', progress: 60, lessons: 15, completed: 9 },
    { name: 'Database Design', progress: 30, lessons: 8, completed: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
            <p className="text-blue-100">Here's what's happening in your community today.</p>
          </div>
          <div className="hidden sm:block">
            <Award className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Progress */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Course Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courseProgress.map((course, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-slate-900 dark:text-white">{course.name}</h4>
                  <Badge variant="secondary">{course.completed}/{course.lessons}</Badge>
                </div>
                <Progress value={course.progress} className="h-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">{course.progress}% complete</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.type === 'course' && <BookOpen className="w-4 h-4 text-white" />}
                  {activity.type === 'event' && <Calendar className="w-4 h-4 text-white" />}
                  {activity.type === 'chat' && <MessageCircle className="w-4 h-4 text-white" />}
                  {activity.type === 'document' && <FileText className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
