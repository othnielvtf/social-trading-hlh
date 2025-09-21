import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that only renders its children if the user is authenticated.
 * Otherwise, it renders the fallback component.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
      <p className="text-muted-foreground text-center mb-6">
        You need to be signed in to view this content.
      </p>
      <button 
        onClick={() => {
          // Get the auth context directly to avoid passing it as a prop
          const { login } = require('../contexts/AuthContext').useAuthContext();
          login();
        }}
        className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-colors"
      >
        Sign In
      </button>
    </div>
  )
}) => {
  const { isAuthenticated, isLoading } = useAuthContext();

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
