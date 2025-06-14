
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
import { useLandingPage } from '@/contexts/LandingPageContext';

const PreviewTabs = ({ onPreviewClick }: { onPreviewClick: () => void }) => {
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const { data } = useLandingPage();
  const { previewTabs } = data;

  const iconMap = {
    'BookOpen': BookOpen,
    'Calendar': Calendar,
    'FileText': FileText,
    'MessageCircle': MessageCircle,
    'Folder': Folder,
    'Trophy': Trophy
  };

  const colorMap = {
    0: 'from-purple-500 to-purple-600',
    1: 'from-cyan-500 to-cyan-600',
    2: 'from-pink-500 to-pink-600',
    3: 'from-orange-500 to-orange-600',
    4: 'from-green-500 to-green-600',
    5: 'from-yellow-500 to-yellow-600'
  };

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
          {previewTabs.map((tab, index) => {
            const IconComponent = iconMap[tab.icon as keyof typeof iconMap] || BookOpen;
            const colorClass = colorMap[index as keyof typeof colorMap];
            
            return (
              <Card 
                key={index} 
                className="glass-card border-purple-500/20 hover:neon-purple transition-all duration-300 hover:scale-105 cursor-pointer"
                onMouseEnter={() => setHoveredTab(index)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClass} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30 text-xs">
                      {tab.stats}
                    </Badge>
                  </div>
                  <CardTitle className="text-white font-space">
                    {tab.name}
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
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PreviewTabs;
