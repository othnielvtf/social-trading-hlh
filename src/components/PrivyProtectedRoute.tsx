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
    <button
      onClick={login}
      className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-colors"
    >
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }
  
  // Otherwise, render fallback
  return <>{fallback}</>;
};
