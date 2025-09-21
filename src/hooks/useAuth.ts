import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useCallback, useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  address?: string;
  email?: string;
  name?: string;
  avatar?: string;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const { 
    ready,
    authenticated, 
    user, 
    login, 
    logout, 
    linkWallet, 
    linkEmail, 
    createWallet 
  } = usePrivy();
  const { wallets } = useWallets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update profile whenever user or wallets change
  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!authenticated || !user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    // Get the first wallet address if available
    const activeWallet = wallets?.[0];
    const walletAddress = activeWallet?.address;

    // Extract user information from Privy user data
    // Note: Privy User type might not have name or avatar directly
    // So we use optional chaining and fallbacks
    const displayName = user.email?.address?.split('@')[0] || 'Anonymous User';
    
    // For avatar, we'll use a generic avatar since Privy might not expose these directly
    const avatarUrl = undefined; // Default to undefined, UI can show a default avatar

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

  // Handle login
  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Connect wallet
  const connectWallet = useCallback(() => {
    linkWallet();
  }, [linkWallet]);

  // Create embedded wallet
  const handleCreateWallet = useCallback(() => {
    createWallet();
  }, [createWallet]);

  // Connect email
  const connectEmail = useCallback(() => {
    linkEmail();
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
