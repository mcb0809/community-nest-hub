
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Calendar, 
  MessageCircle, 
  TrendingUp,
  Zap,
  Target,
  Clock,
  Users,
  Star,
  Trophy,
  Flame,
  ArrowRight
} from 'lucide-react';

const Web3Dashboard = () => {
  const quickStats = [
    { label: 'Khóa học đang học', value: '3', icon: BookOpen, color: 'from-purple-500 to-purple-600' },
    { label: 'Sự kiện tuần này', value: '2', icon: Calendar, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Tin nhắn mới', value: '12', icon: MessageCircle, color: 'from-pink-500 to-pink-600' },
    { label: 'Điểm kinh nghiệm', value: '2,340', icon: Trophy, color: 'from-orange-500 to-orange-600' },
  ];

  const activeCourses = [
    {
      id: 1,
      title: 'AI Automation với Python',
      progress: 65,
      nextLesson: 'Xử lý dữ liệu với Pandas',
      timeLeft: '45 phút',
      difficulty: 'Intermediate',
    },
    {
      id: 2,
      title: 'ChatGPT API Integration',
      progress: 30,
      nextLesson: 'API Authentication',
      timeLeft: '1.5 giờ',
      difficulty: 'Advanced',
    },
    {
      id: 3,
      title: 'No-Code Automation',
      progress: 85,
      nextLesson: 'Zapier Advanced Workflows',
      timeLeft: '20 phút',
      difficulty: 'Beginner',
    },
  ];

  const trendingDiscussions = [
    {
      id: 1,
      title: 'GPT-4 vs Claude: So sánh hiệu suất cho automation',
      author: 'TechMaster_AI',
      replies: 23,
      likes: 45,
      time: '2 giờ trước',
      isHot: true,
    },
    {
      id: 2,
      title: 'Chia sẻ workflow tự động hoá social media',
      author: 'AutomationPro',
      replies: 18,
      likes: 32,
      time: '4 giờ trước',
      isHot: false,
    },
    {
      id: 3,
      title: 'Làm thế nào để tối ưu prompt engineering?',
      author: 'PromptExpert',
      replies: 31,
      likes: 67,
      time: '6 giờ trước',
      isHot: true,
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Live Workshop: Building AI Chatbots',
      date: 'Thứ 6, 15/06',
      time: '19:00 - 21:00',
      speaker: 'Dr. Minh Anh',
      attendees: 234,
      type: 'Workshop',
    },
    {
      id: 2,
      title: 'Monthly AI Trends Meetup',
      date: 'Chủ nhật, 18/06',
      time: '14:00 - 16:00',
      speaker: 'AI Community',
      attendees: 156,
      type: 'Meetup',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-6 border border-purple-500/20 neon-purple">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-space gradient-web3-text mb-2">
              Chào mừng trở lại, AI Learner! 🚀
            </h1>
            <p className="text-slate-300">
              Bạn đã hoàn thành <span className="text-cyan-400 font-semibold">12 khóa học</span> và đạt <span className="text-purple-400 font-semibold">Level 12</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold gradient-web3-text">2,340</div>
            <p className="text-sm text-slate-400">Điểm kinh nghiệm</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="glass-card border-purple-500/20 hover:neon-purple transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Khóa học đang học */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white font-space flex items-center">
                <Target className="w-5 h-5 text-cyan-400 mr-2" />
                Khóa học đang học
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeCourses.map((course) => (
                <div key={course.id} className="glass p-4 rounded-lg border border-purple-500/20 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{course.title}</h3>
                    <Badge 
                      className={`${
                        course.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                        course.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {course.difficulty}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Tiến độ</span>
                      <span className="text-cyan-400">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-sm text-slate-300">Bài tiếp theo: {course.nextLesson}</p>
                        <p className="text-xs text-slate-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {course.timeLeft}
                        </p>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-purple-500 to-cyan-500">
                        Tiếp tục
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sự kiện sắp tới */}
        <div>
          <Card className="glass-card border-purple-500/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white font-space flex items-center">
                <Calendar className="w-5 h-5 text-pink-400 mr-2" />
                Sự kiện sắp tới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="glass p-3 rounded-lg border border-purple-500/20">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white mb-2">
                    {event.type}
                  </Badge>
                  <h4 className="font-medium text-white text-sm mb-2">{event.title}</h4>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>{event.date} • {event.time}</p>
                    <p>Diễn giả: {event.speaker}</p>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {event.attendees} người tham gia
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Thảo luận nổi bật */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white font-space flex items-center">
            <Flame className="w-5 h-5 text-orange-400 mr-2" />
            Thảo luận nổi bật hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendingDiscussions.map((discussion) => (
              <div key={discussion.id} className="glass p-4 rounded-lg border border-purple-500/20 hover:border-cyan-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-white">{discussion.title}</h4>
                      {discussion.isHot && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          🔥 Hot
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span>bởi {discussion.author}</span>
                      <span>{discussion.time}</span>
                      <div className="flex items-center space-x-2">
                        <span>{discussion.replies} phản hồi</span>
                        <Star className="w-3 h-3" />
                        <span>{discussion.likes}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-cyan-400 hover:bg-cyan-500/10">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Web3Dashboard;
