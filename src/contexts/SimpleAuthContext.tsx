import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define user profile type
export interface UserProfile {
  id: string;
  address?: string;
  email?: string;
  name?: string;
  avatar?: string;
  isAuthenticated: boolean;
}

// Define auth context type
interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: () => void;
  logout: () => void;
  connectWallet: () => void;
  connectEmail: () => void;
}

// Create context with default values
export const SimpleAuthContext = createContext<AuthContextType>({
  isLoading: false,
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  connectWallet: () => {},
  connectEmail: () => {},
});

// Mock user data
const mockUser: UserProfile = {
  id: 'user-123',
  name: 'Demo User',
  email: 'demo@example.com',
  isAuthenticated: true
};

// Auth provider component
export const SimpleAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Login function - simulates authentication
  const login = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser(mockUser);
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 500);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Connect wallet function (mock)
  const connectWallet = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({
        ...mockUser,
        address: '0x1234...5678',
      });
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 500);
  };

  // Connect email function (mock)
  const connectEmail = () => {
    // Implementation would go here
    console.log('Connect email clicked');
  };

  // Context value
  const value = {
    isLoading,
    isAuthenticated,
    user,
    login,
    logout,
    connectWallet,
    connectEmail,
  };

  // Provide context to children
  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useSimpleAuth = (): AuthContextType => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
