// Privy configuration
export const PRIVY_APP_ID = process.env.PRIVY_APP_ID || 'your-privy-app-id'; // Replace with your actual Privy App ID

// Define login methods with correct types
type LoginMethod = 'email' | 'wallet' | 'google' | 'twitter' | 'discord' | 'sms' | 'github' | 'linkedin' | 'spotify' | 'instagram' | 'tiktok' | 'line' | 'apple' | 'farcaster' | 'telegram' | 'passkey';

export const privyConfig = {
  appId: PRIVY_APP_ID,
  loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord'] as LoginMethod[],
  appearance: {
    theme: 'light' as 'light' | 'dark',
    accentColor: '#3898FF' as `#${string}`,
    logo: 'https://your-logo-url.com/logo.png', // Replace with your actual logo URL
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: true, // Enable creating wallets on login
    },
  },
};
