import React, { useState, useRef, useEffect } from 'react';
import { Home, Users, Briefcase, TrendingUp, User, Edit3, Settings, MoreHorizontal, Moon, Sun, LogOut, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { usePrivyAuth } from '../contexts/PrivyAuthContext';

// Import a placeholder logo instead of the Figma asset
// In a real app, you would use an actual image file
const logo = '/logo.png'; // Placeholder path

type Page = 'home' | 'explore' | 'portfolio' | 'trade' | 'profile';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onPostClick: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Sidebar({ currentPage, onPageChange, onPostClick, isDarkMode, onToggleDarkMode }: SidebarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, login, logout, connectWallet } = usePrivyAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };
  
  const handleLogin = () => {
    login();
  };

  const menuItems = [
    { id: 'home' as Page, label: 'Home', icon: Home },
    { id: 'explore' as Page, label: 'Communities', icon: Users },
    { id: 'portfolio' as Page, label: 'Portfolio', icon: Briefcase },
    { id: 'trade' as Page, label: 'Trade', icon: TrendingUp },
    { id: 'profile' as Page, label: 'Profile', icon: User },
  ];

  return (
    <div className="w-64 h-screen sticky top-0 p-4 flex flex-col">
      {/* Logo */}
      <div className="mb-4 px-3 flex items-center justify-between">
        <img src={logo} alt="Logo" className="w-12 h-12 mix-blend-multiply dark:mix-blend-normal dark:invert" />
        <button 
          onClick={onToggleDarkMode}
          className="p-2 rounded-full hover:bg-accent/50 transition-colors"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => item.id !== 'trade' && onPageChange(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-full transition-colors text-left ${
                item.id === 'trade' 
                  ? 'opacity-40 cursor-not-allowed' 
                  : isActive 
                    ? 'bg-accent' 
                    : 'hover:bg-accent/50'
              }`}
            >
              <Icon size={24} className={item.id === 'trade' ? 'text-muted-foreground' : isActive ? 'text-foreground' : 'text-foreground'} />
              <span className={`text-base hidden xl:block ${item.id === 'trade' ? 'text-muted-foreground' : ''}`}>{item.label}</span>
            </button>
          );
        })}
        

        
        <button className="w-full flex items-center gap-4 px-3 py-3 rounded-full text-left opacity-40 cursor-not-allowed">
          <MoreHorizontal size={24} />
          <span className="text-base hidden xl:block">More</span>
        </button>
      </nav>
      
      {/* Post Button */}
      <div className="space-y-4">
        <Button 
          onClick={onPostClick}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-4 xl:py-5 px-6"
          size="lg"
        >
          <span className="hidden xl:block">Post</span>
        </Button>
        
        {/* User Profile or Login Button */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-full hover:bg-accent/50 transition-colors"
            >
              <Avatar className="w-10 h-10">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={`${user.name}'s avatar`} 
                    className="w-full h-full object-cover rounded-full" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                    {user.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
              </Avatar>
              <div className="hidden xl:block flex-1 text-left">
                <div className="font-medium">{user.name || 'Anonymous'}</div>
                <div className="text-sm text-muted-foreground">
                  {user.email ? `@${user.email.split('@')[0]}` : user.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : '@user'}
                </div>
              </div>
              <MoreHorizontal className="hidden xl:block w-4 h-4 text-muted-foreground" />
            </button>
            
            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-card border border-border rounded-xl shadow-lg">
                {!user.address && (
                  <button
                    onClick={() => {
                      connectWallet();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-accent/50 transition-colors text-left"
                  >
                    <Wallet size={18} />
                    <span className="hidden xl:block">Connect Wallet</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-colors text-left"
                >
                  <LogOut size={18} />
                  <span className="hidden xl:block">Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button 
            onClick={handleLogin}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-3 xl:py-3"
            size="sm"
          >
            <span className="xl:block">Sign In</span>
          </Button>
        )}
      </div>
    </div>
  );
}