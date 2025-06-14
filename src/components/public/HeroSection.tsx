
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = ({ onJoinClick, onExploreClick }: { 
  onJoinClick: () => void;
  onExploreClick: () => void;
}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center neon-purple">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium Community
            </Badge>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl lg:text-7xl font-bold font-space mb-6">
          <span className="gradient-web3-text">AI AUTOMATION</span>
          <br />
          <span className="gradient-web3-text">CLUB Plus</span>
        </h1>

        {/* Subtitle */}
        <div className="mb-4">
          <span className="text-2xl lg:text-3xl text-slate-300 font-medium">
            MCB AI
          </span>
        </div>

        {/* Description */}
        <p className="text-xl lg:text-2xl text-slate-400 mb-12 max-w-4xl mx-auto leading-relaxed">
          Cộng đồng tiên phong về <span className="text-purple-400 font-semibold">AI, Automation & Workflow MMO</span>
          <br />
          Nơi bạn có thể học – chia sẻ – kiếm tiền cùng cộng đồng
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg"
            onClick={onJoinClick}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold neon-purple transition-all duration-300 hover:scale-105"
          >
            <Zap className="w-5 h-5 mr-2" />
            Tham gia cộng đồng
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            onClick={onExploreClick}
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            Khám phá nội dung miễn phí
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-2xl mx-auto">
          {[
            { number: '500+', label: 'Thành viên' },
            { number: '50+', label: 'Khóa học' },
            { number: '1000+', label: 'Bài viết' },
            { number: '24/7', label: 'AI Support' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl lg:text-3xl font-bold gradient-web3-text mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
