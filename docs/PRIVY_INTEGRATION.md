# Privy Authentication Integration

This document outlines how Privy authentication has been integrated into the Social Trading application.

## Overview

Privy is a web3-focused authentication solution that allows users to sign in with various methods including email, social accounts, and crypto wallets. This integration enables users to authenticate with the application and access protected features.

## Implementation Details

The Privy integration in this application follows a clean architecture pattern with separation of concerns. We've implemented a layered approach to ensure proper isolation and maintainability:

### Architecture

1. **Base Layer**: The PrivyProvider from the Privy SDK
   - Provides the core authentication functionality
   - Initialized in main.tsx with the Privy App ID

2. **Types Layer**: Common type definitions (`src/contexts/PrivyAuthContext.tsx`)
   - Contains shared type definitions like `UserProfile`
   - Prevents circular dependencies between components

3. **Context Layer**: Our custom PrivyAuthContext
   - Wraps Privy's hooks in a React context
   - Provides a simplified interface for authentication state
   - Handles data transformation and error handling

4. **Component Layer**: UI components that use the auth context
   - Components use the usePrivyAuth hook to access auth state
   - Protected routes prevent access to authenticated features
   - UI adapts based on authentication state

## Setup

### 1. Installation

The Privy SDK is installed via npm:

```bash
npm install @privy-io/react-auth
```

### 2. Configuration

The Privy configuration is defined directly in `src/main.tsx`:

```typescript
import React from "react";
import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import App from "./App.tsx";
import "./index.css";

// Privy App ID - in a real app, this would come from environment variables
const PRIVY_APP_ID = "cmd9y0aeh00a9l10n8kx5klqu";

// Get the root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create a root
const root = createRoot(rootElement);

// Render the app with Privy provider
root.render(
  <React.StrictMode>
    {/* @ts-ignore - Ignoring type error for the children prop */}
    <PrivyProvider appId={PRIVY_APP_ID}>
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
```

### 3. Auth Context

We've created a custom auth context in `src/contexts/PrivyAuthContext.tsx` that wraps the Privy hooks:

```typescript
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
  const { ready, authenticated, user, login, logout, linkWallet, createWallet } = usePrivy();
  const { wallets } = useWallets();
  
  // Create the context value with user profile data
  const contextValue = {
    isLoading: !ready,
    isAuthenticated: authenticated,
    user: authenticated ? { /* user profile data */ } : null,
    login,
    logout,
    connectWallet: linkWallet,
    createWallet,
  };
  
  return (
    <PrivyAuthContext.Provider value={contextValue}>
      {children}
    </PrivyAuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const usePrivyAuth = () => {
  const context = useContext(PrivyAuthContext);
  if (!context) throw new Error('usePrivyAuth must be used within a PrivyAuthProvider');
  return context;
};
```

### 4. Protected Routes

We've created a protected route component in `src/components/PrivyProtectedRoute.tsx` that only allows authenticated users to access certain content:

```typescript
import React from 'react';
import { usePrivyAuth } from '../contexts/PrivyAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Login button component
const LoginButton: React.FC = () => {
  const { login } = usePrivyAuth();
  
  return (
    <button onClick={login} className="bg-primary text-primary-foreground px-6 py-2 rounded-full">
      Sign In
    </button>
  );
};

// Default fallback component
const DefaultFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
    <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
    <p className="text-muted-foreground text-center mb-6">
      You need to be signed in to view this content.
    </p>
    <LoginButton />
  </div>
);

/**
 * A component that only renders its children if the user is authenticated.
 * Otherwise, it renders the fallback component.
 */
export const PrivyProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <DefaultFallback />
}) => {
  const { isAuthenticated, isLoading } = usePrivyAuth();
  
  // Show loading state
  if (isLoading) {
    return <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>;
  }
  
  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  // Otherwise, render fallback
  return <>{fallback}</>;
};
```

### 5. Usage in App Component

Finally, we use our auth context in the App component (`src/App.tsx`):

```typescript
import React, { useState } from 'react';
import { PrivyAuthProvider, usePrivyAuth } from './contexts/PrivyAuthContext';
import { PrivyProtectedRoute } from './components/PrivyProtectedRoute';

// Main content component that uses the auth context
const AppContent: React.FC = () => {
  const { isLoading, isAuthenticated, user, login, logout } = usePrivyAuth();
  const [showProtected, setShowProtected] = useState(false);

  if (isLoading) {
    return <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Privy Authentication Test</h1>
        
        {isAuthenticated ? (
          <div>
            <p className="mb-4">
              <span className="font-semibold">Logged in as:</span> {user?.email || user?.name || 'Anonymous User'}
            </p>
            <button onClick={logout} className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md">
              Log Out
            </button>
            
            <div className="mt-6 p-4 bg-muted rounded-md">
              <PrivyProtectedRoute>
                <h2 className="text-xl font-semibold mb-2">Protected Content</h2>
                <p>This content is only visible to authenticated users.</p>
              </PrivyProtectedRoute>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4">You are not logged in.</p>
            <button onClick={login} className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
              Log In with Privy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App component wrapped with PrivyAuthProvider
const App: React.FC = () => {
  return (
    <PrivyAuthProvider>
      <AppContent />
    </PrivyAuthProvider>
  );
};

export default App;
```

## Production Configuration

For production deployment:

1. Create a Privy account at [privy.io](https://privy.io)
2. Create a new application in the Privy dashboard
3. Copy your Privy App ID
4. Set the Privy App ID in your deployment environment
5. Configure allowed domains in the Privy dashboard

## Additional Resources

- [Privy Documentation](https://docs.privy.io/)
- [Privy React SDK Reference](https://docs.privy.io/guide/react/installation)
    login, 
    logout, 
    linkWallet, 
    linkEmail, 
    createWallet 
  } = privy;
  
  // Local state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update profile whenever user or wallets change
  useEffect(() => {
    // Handle authentication state changes
    // ...
  }, [ready, authenticated, user, wallets]);

  // Return authentication state and methods
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
4. Set the `VITE_PRIVY_APP_ID` environment variable in your deployment environment
5. Configure allowed domains in the Privy dashboard

> **Note**: Remember that in Vite, all environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

## Additional Resources

- [Privy Documentation](https://docs.privy.io/)
- [Privy React SDK Reference](https://docs.privy.io/guide/react/installation)
