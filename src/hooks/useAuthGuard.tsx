
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useAuthGuard = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const requireAuth = (callback?: () => void) => {
    if (loading) return false;
    
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    
    if (callback) callback();
    return true;
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return {
    isAuthenticated: !!user && !loading,
    showAuthModal,
    requireAuth,
    closeAuthModal,
    loading
  };
};
