import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { AuthProvider } from './contexts/AuthContext';
import { useAuthContext } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { Home } from './components/pages/Home';
import { Explore } from './components/pages/Explore';
import { Portfolio } from './components/pages/Portfolio';
import { Trade } from './components/pages/Trade';
import { Profile } from './components/pages/Profile';
import { PostModal } from './components/PostModal';
import { ProtectedRoute } from './components/ProtectedRoute';

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

  const { ready } = usePrivy();

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex justify-center">
        <div className="flex w-full max-w-7xl">
          <Sidebar 
            currentPage={currentPage} 
            onPageChange={(page) => {
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

// Main App component wrapped with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
