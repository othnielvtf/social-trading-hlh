// Privy configuration
// Use environment variable for the App ID
declare global {
  interface ImportMeta {
    env: {
      VITE_PRIVY_APP_ID: string;
      [key: string]: any;
    };
  }
}

export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'cmd9y0aeh00a9l10n8kx5klqu';

// Define login methods with correct types
type LoginMethod = 'email' | 'wallet' | 'google' | 'twitter' | 'discord' | 'sms' | 'github' | 'linkedin' | 'spotify' | 'instagram' | 'tiktok' | 'line' | 'apple' | 'farcaster' | 'telegram' | 'passkey';

// Privy configuration object
export const privyConfig = {
  appId: PRIVY_APP_ID,
  loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord'] as LoginMethod[],
  appearance: {
    theme: 'light' as 'light' | 'dark',
    accentColor: '#3898FF' as `#${string}`,
    logo: '/logo.png', // Using the placeholder logo we created
  },
  // Only include essential configuration to avoid type errors
};
