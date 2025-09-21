import React, { createContext, useContext, ReactNode } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';

// Define the user profile interface
export interface UserProfile {
  id: string;
  address?: string;
  email?: string;
  name?: string;
  avatar?: string;
  isAuthenticated: boolean;
}

// Define the auth context interface
interface PrivyAuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: () => void;
  logout: () => void;
  connectWallet: () => void;
  createWallet: () => void;
}

// Create the context
const PrivyAuthContext = createContext<PrivyAuthContextType | undefined>(undefined);

// Provider component
export const PrivyAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use Privy hooks directly
  const { 
    ready,
    authenticated, 
    user, 
    login, 
    logout, 
    linkWallet, 
    createWallet 
  } = usePrivy();
  
  const { wallets } = useWallets();
  
  // Determine loading state
  const isLoading = !ready;
  
  // Create user profile from Privy user data
  let userProfile: UserProfile | null = null;
  
  if (authenticated && user) {
    // Get the first wallet address if available
    const activeWallet = wallets?.[0];
    const walletAddress = activeWallet?.address;
    
    // Create a display name from available user data
    const displayName = user.email?.address?.split('@')[0] || 'Anonymous User';
    
    userProfile = {
      id: user.id,
      address: walletAddress,
      email: user.email?.address,
      name: displayName,
      avatar: undefined, // No avatar for now
      isAuthenticated: authenticated,
    };
  }
  
  // Create the context value
  const contextValue: PrivyAuthContextType = {
    isLoading,
    isAuthenticated: authenticated,
    user: userProfile,
    login,
    logout,
    connectWallet: linkWallet,
    createWallet,
  };
  
  // Provide the context to children
  return (
    <PrivyAuthContext.Provider value={contextValue}>
      {children}
    </PrivyAuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const usePrivyAuth = (): PrivyAuthContextType => {
  const context = useContext(PrivyAuthContext);
  
  if (context === undefined) {
    throw new Error('usePrivyAuth must be used within a PrivyAuthProvider');
  }
  
  return context;
};
