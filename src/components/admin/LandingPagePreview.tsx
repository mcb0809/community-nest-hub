
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Zap, ArrowRight, Sparkles, Brain, MessageCircle } from 'lucide-react';

interface PreviewProps {
  heroData: any;
  aboutData: any;
  stats: any[];
  previewTabs: any[];
  aiHelperData: any;
}

const LandingPagePreview: React.FC<PreviewProps> = ({
  heroData,
  aboutData,
  stats,
  previewTabs,
  aiHelperData
}) => {
  const iconMap = {
    'BookOpen': '📚',
    'Calendar': '📅',
    'FileText': '📄',
    'MessageCircle': '💬',
    'Folder': '📁',
    'Trophy': '🏆'
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Mini Hero Section */}
      <div className="p-6 text-center border-b border-purple-500/20">
        <div className="inline-flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30 text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
        
        <h1 className="text-2xl font-bold font-space gradient-web3-text mb-2">
          {heroData.title}
        </h1>
        
        <div className="text-sm text-slate-300 mb-2">
          {heroData.subtitle}
        </div>
        
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          {heroData.description.split('\n')[0]}
        </p>
        
        <div className="flex flex-col gap-2">
          <Button size="sm" className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs">
            <Zap className="w-3 h-3 mr-1" />
            {heroData.primaryButton}
          </Button>
          
          <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-300 text-xs">
            {heroData.secondaryButton}
          </Button>
        </div>
        
        {/* Mini Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-bold gradient-web3-text">
                {stat.number}
              </div>
              <div className="text-xs text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini About Section */}
      <div className="p-4 border-b border-purple-500/20">
        <h3 className="text-lg font-bold gradient-web3-text mb-2">
          {aboutData.title}
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          {aboutData.description}
        </p>
        <div className="space-y-2">
          {aboutData.features.slice(0, 2).map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-purple-400">🚀</span>
              <span className="text-xs text-white">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Preview Tabs */}
      <div className="p-4 border-b border-purple-500/20">
        <h3 className="text-sm font-semibold text-purple-300 mb-3">Preview Tabs</h3>
        <div className="grid grid-cols-2 gap-2">
          {previewTabs.slice(0, 4).map((tab, index) => (
            <Card key={index} className="glass-card border-purple-500/20 p-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{iconMap[tab.icon as keyof typeof iconMap] || '📚'}</span>
                <div>
                  <div className="text-xs font-medium text-white">{tab.name}</div>
                  <div className="text-xs text-purple-300">{tab.stats}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Mini AI Helper */}
      <div className="p-4">
        <Card className="glass-card border-purple-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center mb-2">
              <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs">
                <Brain className="w-3 h-3 mr-1" />
                {aiHelperData.subtitle}
              </Badge>
            </div>
            <CardTitle className="text-sm text-center gradient-web3-text">
              {aiHelperData.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-slate-400 text-center mb-3">
              {aiHelperData.description}
            </p>
            
            {/* Mini demo chat */}
            <div className="glass p-2 rounded-lg border border-purple-500/20 mb-3">
              <div className="space-y-2">
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white p-1 rounded text-xs max-w-[80%]">
                    {aiHelperData.demoMessages[0]?.question.slice(0, 30)}...
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="glass border border-purple-500/30 p-1 rounded text-xs max-w-[80%]">
                    <div className="flex items-center space-x-1 mb-1">
                      <Brain className="w-2 h-2 text-purple-400" />
                      <span className="text-xs text-purple-300">AI</span>
                    </div>
                    <span className="text-slate-300">
                      {aiHelperData.demoMessages[0]?.answer.slice(0, 40)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button size="sm" className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs">
              <Brain className="w-3 h-3 mr-1" />
              {aiHelperData.buttonText}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandingPagePreview;
