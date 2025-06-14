
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  MessageCircle, 
  Calendar, 
  TrendingUp,
  Activity,
  Shield,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { name: 'Tổng Users', value: '1,234', change: '+12%', icon: Users, color: 'from-blue-500 to-blue-600' },
    { name: 'Khóa học', value: '89', change: '+5%', icon: BookOpen, color: 'from-green-500 to-green-600' },
    { name: 'Tin nhắn hôm nay', value: '2,456', change: '+18%', icon: MessageCircle, color: 'from-purple-500 to-purple-600' },
    { name: 'Sự kiện', value: '15', change: '+3%', icon: Calendar, color: 'from-orange-500 to-orange-600' },
  ];

  const systemStatus = [
    { name: 'Database', status: 'healthy', icon: Database, color: 'text-green-400' },
    { name: 'API Service', status: 'healthy', icon: Activity, color: 'text-green-400' },
    { name: 'File Storage', status: 'warning', icon: AlertTriangle, color: 'text-yellow-400' },
    { name: 'Authentication', status: 'healthy', icon: Shield, color: 'text-green-400' },
  ];

  const recentActivity = [
    { type: 'user', action: 'Người dùng mới đăng ký', user: 'john.doe@email.com', time: '5 phút trước' },
    { type: 'course', action: 'Khóa học được tạo', user: 'admin', time: '15 phút trước' },
    { type: 'message', action: 'Báo cáo tin nhắn spam', user: 'user123', time: '30 phút trước' },
    { type: 'system', action: 'Backup dữ liệu hoàn thành', user: 'system', time: '1 giờ trước' },
  ];

  const topCourses = [
    { name: 'React Advanced Patterns', students: 234, revenue: '45,000,000đ' },
    { name: 'Node.js Backend Development', students: 189, revenue: '32,000,000đ' },
    { name: 'Database Design', students: 156, revenue: '28,000,000đ' },
    { name: 'UI/UX Design Fundamentals', students: 145, revenue: '25,000,000đ' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-red-100">Chào mừng đến với bảng điều khiển quản trị hệ thống</p>
          </div>
          <div className="hidden sm:block">
            <Shield className="w-16 h-16 text-red-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-green-400">{stat.change}</p>
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
        {/* System Status */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Activity className="w-5 h-5 text-red-400" />
              <span>Trạng thái hệ thống</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemStatus.map((system, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                <div className="flex items-center space-x-3">
                  <system.icon className={`w-5 h-5 ${system.color}`} />
                  <span className="text-white font-medium">{system.name}</span>
                </div>
                <Badge 
                  variant={system.status === 'healthy' ? 'default' : 'secondary'}
                  className={
                    system.status === 'healthy' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }
                >
                  {system.status === 'healthy' ? 'Hoạt động tốt' : 'Cảnh báo'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Clock className="w-5 h-5 text-red-400" />
              <span>Hoạt động gần đây</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/50">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.type === 'user' && <Users className="w-4 h-4 text-white" />}
                  {activity.type === 'course' && <BookOpen className="w-4 h-4 text-white" />}
                  {activity.type === 'message' && <MessageCircle className="w-4 h-4 text-white" />}
                  {activity.type === 'system' && <Activity className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.action}</p>
                  <p className="text-xs text-slate-400">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <BarChart3 className="w-5 h-5 text-red-400" />
            <span>Khóa học hàng đầu</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{course.name}</h4>
                    <p className="text-sm text-slate-400">{course.students} học viên</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">{course.revenue}</p>
                  <p className="text-xs text-slate-400">Doanh thu</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
