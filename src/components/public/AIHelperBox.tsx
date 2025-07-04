
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useLandingPage } from '@/contexts/LandingPageContext';

const AIHelperBox = ({ onTryAI }: { onTryAI: () => void }) => {
  const [currentDemo, setCurrentDemo] = useState(0);
  const { data } = useLandingPage();
  const { aiHelper } = data;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % aiHelper.demoMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [aiHelper.demoMessages.length]);

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-card border-purple-500/20 neon-purple">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2">
                <Brain className="w-4 h-4 mr-2" />
                {aiHelper.subtitle}
              </Badge>
            </div>
            
            <CardTitle className="text-3xl font-bold font-space gradient-web3-text mb-2">
              {aiHelper.title}
            </CardTitle>
            
            <p className="text-slate-400">
              {aiHelper.description}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Demo Chat */}
            <div className="glass p-6 rounded-xl border border-purple-500/20">
              <div className="space-y-4">
                {/* User Question */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white p-3 rounded-2xl rounded-tr-sm max-w-xs">
                    <p className="text-sm">
                      {aiHelper.demoMessages[currentDemo].question}
                    </p>
                  </div>
                </div>
                
                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="glass border border-purple-500/30 p-3 rounded-2xl rounded-tl-sm max-w-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-purple-300 font-medium">AI Assistant</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300">
                      {aiHelper.demoMessages[currentDemo].answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: MessageCircle,
                  title: 'Chat 24/7',
                  desc: 'Hỗ trợ liên tục'
                },
                {
                  icon: Sparkles,
                  title: 'Personalized',
                  desc: 'Tùy chỉnh theo nhu cầu'
                },
                {
                  icon: Brain,
                  title: 'Smart Learning',
                  desc: 'Học từ cộng đồng'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 flex items-center justify-center`}>
                    <feature.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-medium text-white mb-1">{feature.title}</h4>
                  <p className="text-xs text-slate-400">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Button 
                onClick={onTryAI}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-6 py-3"
              >
                <Brain className="w-4 h-4 mr-2" />
                {aiHelper.buttonText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AIHelperBox;
