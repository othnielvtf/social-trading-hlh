import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useCallback, useEffect, useState } from 'react';
import { UserProfile } from '../types/auth';

/**
 * Custom hook for authentication using Privy
 * Provides a simplified interface for authentication state and methods
 */
export const useAuth = () => {
  // Use Privy hooks
  const privy = usePrivy();
  const { wallets } = useWallets();
  
  // Destructure what we need from privy
  const { 
    ready,
    authenticated, 
    user, 
    login, 
    logout, 
    linkWallet, 
    linkEmail, 
    createWallet 
  } = privy;
  
  // Local state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('Privy state:', { ready, authenticated, user, wallets });
  }, [ready, authenticated, user, wallets]);

  // Update profile whenever user or wallets change
  useEffect(() => {
    if (!ready) {
      console.log('Privy not ready yet');
      return;
    }

    if (!authenticated || !user) {
      console.log('User not authenticated or no user data');
      setProfile(null);
      setIsLoading(false);
      return;
    }

    // Get the first wallet address if available
    const activeWallet = wallets?.[0];
    const walletAddress = activeWallet?.address;

    // Extract user information from Privy user data
    let displayName = 'Anonymous User';
    let avatarUrl: string | undefined = undefined;
    
    // Try to get name from various sources
    if (user.email?.address) {
      displayName = user.email.address.split('@')[0];
    }
    
    // Try to get avatar from wallet or other sources if available
    // For now, use a default avatar

    console.log('Creating user profile:', { 
      id: user.id, 
      email: user.email?.address,
      walletAddress,
      displayName 
    });

    // Construct user profile from Privy user data
    const userProfile: UserProfile = {
      id: user.id,
      address: walletAddress,
      email: user.email?.address,
      name: displayName,
      avatar: avatarUrl,
      isAuthenticated: authenticated,
    };

    setProfile(userProfile);
    setIsLoading(false);
  }, [ready, authenticated, user, wallets]);

  // Handle login with error handling
  const handleLogin = useCallback(() => {
    try {
      console.log('Attempting to login with Privy');
      login();
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [login]);

  // Handle logout with error handling
  const handleLogout = useCallback(() => {
    try {
      console.log('Logging out');
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout]);

  // Connect wallet with error handling
  const connectWallet = useCallback(() => {
    try {
      console.log('Connecting wallet');
      linkWallet();
    } catch (error) {
      console.error('Connect wallet error:', error);
    }
  }, [linkWallet]);

  // Create embedded wallet with error handling
  const handleCreateWallet = useCallback(() => {
    try {
      console.log('Creating wallet');
      createWallet();
    } catch (error) {
      console.error('Create wallet error:', error);
    }
  }, [createWallet]);

  // Connect email with error handling
  const connectEmail = useCallback(() => {
    try {
      console.log('Connecting email');
      linkEmail();
    } catch (error) {
      console.error('Connect email error:', error);
    }
  }, [linkEmail]);

  return {
    isLoading,
    isAuthenticated: authenticated,
    user: profile,
    login: handleLogin,
    logout: handleLogout,
    connectWallet,
    connectEmail,
    createWallet: handleCreateWallet,
  };
};
