
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  MessageCircle, 
  Folder, 
  Trophy,
  ArrowRight,
  Eye
} from 'lucide-react';

const PreviewTabs = ({ onPreviewClick }: { onPreviewClick: () => void }) => {
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);

  const tabs = [
    {
      icon: BookOpen,
      title: 'Khóa học',
      description: 'Từ AI cơ bản đến nâng cao',
      preview: 'Hơn 50 khóa học chất lượng cao',
      color: 'from-purple-500 to-purple-600',
      stats: '50+ khóa học'
    },
    {
      icon: Calendar,
      title: 'Sự kiện',
      description: 'Workshop, meetup hàng tuần',
      preview: 'Sự kiện trực tuyến và offline',
      color: 'from-cyan-500 to-cyan-600',
      stats: '5+ events/tháng'
    },
    {
      icon: FileText,
      title: 'Bài viết',
      description: 'Kiến thức và case study',
      preview: 'Cập nhật xu hướng mới nhất',
      color: 'from-pink-500 to-pink-600',
      stats: '1000+ bài viết'
    },
    {
      icon: MessageCircle,
      title: 'Thảo luận',
      description: 'Cộng đồng năng động',
      preview: 'Trao đổi và hỗ trợ 24/7',
      color: 'from-orange-500 to-orange-600',
      stats: '500+ thành viên'
    },
    {
      icon: Folder,
      title: 'Tài liệu',
      description: 'Thư viện kiến thức phong phú',
      preview: 'Templates, tools, guides',
      color: 'from-green-500 to-green-600',
      stats: '100+ tài liệu'
    },
    {
      icon: Trophy,
      title: 'Xếp hạng',
      description: 'Hệ thống điểm và level',
      preview: 'Thi đua học tập tích cực',
      color: 'from-yellow-500 to-yellow-600',
      stats: 'Top 100 learners'
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30 mb-4">
            <Eye className="w-4 h-4 mr-2" />
            Khám phá nội dung
          </Badge>
          
          <h2 className="text-4xl lg:text-5xl font-bold font-space gradient-web3-text mb-6">
            Điều hướng preview
          </h2>
          
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Xem trước những gì bạn sẽ có được khi tham gia cộng đồng
          </p>
        </div>

        {/* Tabs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tabs.map((tab, index) => (
            <Card 
              key={index} 
              className="glass-card border-purple-500/20 hover:neon-purple transition-all duration-300 hover:scale-105 cursor-pointer"
              onMouseEnter={() => setHoveredTab(index)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tab.color} flex items-center justify-center`}>
                    <tab.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30 text-xs">
                    {tab.stats}
                  </Badge>
                </div>
                <CardTitle className="text-white font-space">
                  {tab.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-slate-400 mb-4">
                  {tab.description}
                </p>
                
                {hoveredTab === index && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="glass p-3 rounded-lg border border-purple-500/20">
                      <p className="text-sm text-purple-300">
                        {tab.preview}
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={onPreviewClick}
                      className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                    >
                      Xem thử nội dung
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreviewTabs;
