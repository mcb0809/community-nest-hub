
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Web3Sidebar from './Web3Sidebar';
import Web3Header from './Web3Header';
import LandingPage from '@/pages/LandingPage';

const Web3DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Show landing page for non-authenticated users on root path
  if (!loading && !user && location.pathname === '/') {
    return <LandingPage />;
  }

  // Show loading or redirect for non-authenticated users on other paths
  if (!loading && !user && location.pathname !== '/') {
    navigate('/auth');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 tech-grid flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-300">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 dark:from-black dark:via-purple-900/10 dark:to-black tech-grid">
      <Web3Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:ml-20 flex flex-col min-h-screen">
        <Web3Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
        />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Web3DashboardLayout;
