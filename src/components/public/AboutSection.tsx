
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  GraduationCap, 
  MessageCircle, 
  Brain,
  Users,
  TrendingUp
} from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Rocket,
      title: 'Cập nhật kiến thức AI & Automation liên tục',
      description: 'Luôn đi đầu xu hướng công nghệ mới nhất',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: GraduationCap,
      title: 'Khóa học miễn phí & chuyên sâu',
      description: 'Từ cơ bản đến nâng cao, phù hợp mọi trình độ',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: MessageCircle,
      title: 'Cộng đồng thảo luận chất lượng cao',
      description: 'Kết nối với những người cùng đam mê',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Brain,
      title: 'Tích hợp AI Assistant cá nhân',
      description: 'Hỗ trợ học tập và giải đáp 24/7',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30 mb-4">
            <Users className="w-4 h-4 mr-2" />
            Về AI Automation Club
          </Badge>
          
          <h2 className="text-4xl lg:text-5xl font-bold font-space gradient-web3-text mb-6">
            Cộng đồng tiên phong về AI
          </h2>
          
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            AI Automation Club là nơi kết nối những người đam mê tự động hóa và AI, 
            nơi bạn có thể học – chia sẻ – kiếm tiền cùng cộng đồng.
          </p>
        </div>

        {/* Main Image/Logo */}
        <div className="flex justify-center mb-16">
          <div className="relative">
            <div className="w-64 h-64 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl border border-purple-500/30 flex items-center justify-center backdrop-blur-xl neon-purple">
              <img 
                src="/lovable-uploads/11edfb67-eb77-4776-a33e-5dc1c4450bd3.png" 
                alt="AI Automation Club Logo"
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="absolute -top-4 -right-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white animate-pulse">
                <TrendingUp className="w-4 h-4 mr-1" />
                Trending
              </Badge>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="glass-card border-purple-500/20 hover:neon-purple transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 font-space">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
