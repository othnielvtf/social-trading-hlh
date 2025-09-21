import React, { useState, useEffect } from 'react';
import { CombinedAuthProvider } from './contexts/FirestoreAuthContext';
import { useFirestoreAuthContext } from './contexts/FirestoreAuthContext';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { Home } from './components/pages/Home';
import { Explore } from './components/pages/Explore';
import { Portfolio } from './components/pages/Portfolio';
import { Trade } from './components/pages/Trade';
import { Profile } from './components/pages/Profile';
import { PostModal } from './components/PostModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { isUserProfileComplete } from './utils/profile';

type Page = 'home' | 'explore' | 'portfolio' | 'trade' | 'profile';

// Main application content component
function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to light mode
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const { isLoading, isAuthenticated, user } = useFirestoreAuthContext();

  // Effect to handle dark mode class and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const navigateToProfile = (userId?: string) => {
    setCurrentUserId(userId || null);
    setCurrentPage('profile');
  };

  // Enforce profile completion: redirect to Profile if authenticated but incomplete
  useEffect(() => {
    if (isAuthenticated && !isUserProfileComplete(user) && currentPage !== 'profile') {
      setCurrentUserId(null);
      setCurrentPage('profile');
    }
  }, [isAuthenticated, user, currentPage]);

  // Show loading state while Privy is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onUserClick={navigateToProfile} />;
      case 'explore':
        return <Explore onUserClick={navigateToProfile} />;
      case 'portfolio':
        return (
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        );
      case 'trade':
        return (
          <ProtectedRoute>
            <Trade />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute>
            <Profile userId={currentUserId} onUserClick={navigateToProfile} />
          </ProtectedRoute>
        );
      default:
        return <Home onUserClick={navigateToProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex justify-center">
        <div className="flex w-full max-w-7xl">
          <Sidebar 
            currentPage={currentPage} 
            onPageChange={(page) => {
              // Block navigation away if profile is incomplete
              const profileComplete = isUserProfileComplete(user);
              if (isAuthenticated && !profileComplete && page !== 'profile') {
                // Enforce staying on Profile until completion
                setCurrentPage('profile');
                setCurrentUserId(null);
                return;
              }
              setCurrentPage(page);
              if (page === 'profile') {
                setCurrentUserId(null); // Reset to own profile when clicking sidebar
              }
            }}
            onPostClick={() => setIsPostModalOpen(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
          <main className={`flex-1 border-l border-r border-border ${currentPage === 'portfolio' ? '' : 'max-w-2xl'}`}>
            {renderPage()}
          </main>
          <RightSidebar currentPage={currentPage} onUserClick={navigateToProfile} />
        </div>
      </div>
      <PostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />
    </div>
  );
}

// Main App component wrapped with CombinedAuthProvider
const App: React.FC = () => {
  return (
    <CombinedAuthProvider>
      <AppContent />
    </CombinedAuthProvider>
  );
};

export default App;
