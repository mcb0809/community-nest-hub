
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPageProvider } from '@/contexts/LandingPageContext';
import HeroSection from '@/components/public/HeroSection';
import AboutSection from '@/components/public/AboutSection';
import PreviewTabs from '@/components/public/PreviewTabs';
import AIHelperBox from '@/components/public/AIHelperBox';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    navigate('/auth');
  };

  const handleExploreClick = () => {
    navigate('/auth');
  };

  const handlePreviewClick = () => {
    navigate('/auth');
  };

  const handleTryAI = () => {
    navigate('/auth');
  };

  return (
    <LandingPageProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 tech-grid">
        <HeroSection 
          onJoinClick={handleJoinClick}
          onExploreClick={handleExploreClick}
        />
        
        <AboutSection />
        
        <PreviewTabs onPreviewClick={handlePreviewClick} />
        
        <AIHelperBox onTryAI={handleTryAI} />
        
        {/* Footer */}
        <footer className="py-12 px-4 border-t border-purple-500/20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="text-2xl font-bold font-space gradient-web3-text mb-4">
              AI Automation Club Plus
            </div>
            <p className="text-slate-400 mb-6">
              Cộng đồng tiên phong về AI & Automation
            </p>
            <div className="text-sm text-slate-500">
              © 2024 MCB AI. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </LandingPageProvider>
  );
};

export default LandingPage;
