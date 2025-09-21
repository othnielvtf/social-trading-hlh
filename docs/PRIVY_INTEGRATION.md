# Privy Authentication Integration

This document outlines how Privy authentication has been integrated into the Social Trading application.

## Overview

Privy is a web3-focused authentication solution that allows users to sign in with various methods including email, social accounts, and crypto wallets. This integration enables users to authenticate with the application and access protected features.

## Setup

### 1. Installation

The Privy SDK is installed via npm:

```bash
npm install @privy-io/react-auth
```

### 2. Configuration

The Privy configuration is defined in `src/config/privy.ts`:

```typescript
// Privy configuration
export const PRIVY_APP_ID = process.env.PRIVY_APP_ID || 'your-privy-app-id';

// Define login methods with correct types
type LoginMethod = 'email' | 'wallet' | 'google' | 'twitter' | 'discord' | 'sms' | 'github' | 'linkedin' | 'spotify' | 'instagram' | 'tiktok' | 'line' | 'apple' | 'farcaster' | 'telegram' | 'passkey';

export const privyConfig = {
  appId: PRIVY_APP_ID,
  loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord'] as LoginMethod[],
  appearance: {
    theme: 'light' as 'light' | 'dark',
    accentColor: '#3898FF' as `#${string}`,
    logo: 'https://your-logo-url.com/logo.png',
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: true,
    },
  },
};
```

### 3. Provider Setup

The Privy provider is initialized in `src/main.tsx`:

```tsx
import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import App from "./App.tsx";
import "./index.css";
import { privyConfig } from "./config/privy";

createRoot(document.getElementById("root")!).render(
  <PrivyProvider
    appId={privyConfig.appId}
    config={{
      loginMethods: privyConfig.loginMethods,
      appearance: privyConfig.appearance,
      embeddedWallets: privyConfig.embeddedWallets,
    }}
  >
    <App />
  </PrivyProvider>
);
```

## Authentication Context

### 1. Auth Hook

A custom hook (`useAuth`) is created in `src/hooks/useAuth.ts` to handle authentication state and methods:

```typescript
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
  // Implementation details...
  
  return {
    isLoading,
    isAuthenticated,
    user: profile,
    login,
    logout,
    connectWallet,
    connectEmail,
    createWallet,
  };
};
```

### 2. Auth Context

An authentication context is created in `src/contexts/AuthContext.tsx` to provide authentication state throughout the application:

```typescript
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, UserProfile } from '../hooks/useAuth';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: () => void;
  logout: () => void;
  connectWallet: () => void;
  connectEmail: (email: string) => void;
  createWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
```

## Protected Routes

A `ProtectedRoute` component is created in `src/components/ProtectedRoute.tsx` to restrict access to authenticated users:

```typescript
import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = (
    // Default fallback UI for unauthenticated users
  )
}) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
```

## Usage in Components

### 1. Sidebar Component

The Sidebar component uses authentication to display user information and login/logout functionality:

```tsx
// Inside Sidebar.tsx
const { isAuthenticated, user, login, logout, connectWallet } = useAuthContext();

// Conditional rendering based on authentication state
{isAuthenticated && user ? (
  <UserProfileSection user={user} onLogout={logout} />
) : (
  <LoginButton onLogin={login} />
)}
```

### 2. Protected Features

Features like the Portfolio, Trade, and Profile pages are protected using the ProtectedRoute component:

```tsx
// Inside App.tsx
case 'portfolio':
  return (
    <ProtectedRoute>
      <Portfolio />
    </ProtectedRoute>
  );
```

### 3. PostModal

The PostModal requires authentication to create posts:

```tsx
// Inside PostModal.tsx
const { isAuthenticated, user, login } = useAuthContext();

// Conditional rendering based on authentication state
{!isAuthenticated ? (
  <AuthenticationRequired onLogin={login} />
) : (
  <PostCreationForm user={user} />
)}
```

## Production Configuration

For production deployment:

1. Create a Privy account at [privy.io](https://privy.io)
2. Create a new application in the Privy dashboard
3. Copy your Privy App ID
4. Set the `PRIVY_APP_ID` environment variable in your deployment environment
5. Configure allowed domains in the Privy dashboard

## Additional Resources

- [Privy Documentation](https://docs.privy.io/)
- [Privy React SDK Reference](https://docs.privy.io/guide/react/installation)
