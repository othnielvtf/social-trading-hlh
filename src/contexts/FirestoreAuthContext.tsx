import React, { createContext, useContext, ReactNode } from 'react';
import { PrivyAuthProvider } from './PrivyAuthContext';
import useFirestoreAuth from '../hooks/useFirestoreAuth';
import { UserData } from '../utils/firestore';
import { UserProfile } from '../types/auth';

// Define the auth context type
interface FirestoreAuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  privyUser: UserProfile | null;
  user: UserData | null;
  updateProfile: (updates: Partial<UserData>) => Promise<boolean>;
  login: () => void;
  logout: () => void;
  connectWallet: () => void;
  createWallet: () => void;
}

// Create the context
const FirestoreAuthContext = createContext<FirestoreAuthContextType | undefined>(undefined);

// Provider component
export const FirestoreAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // We need to wrap this in PrivyAuthProvider, but it's already provided in App.tsx
  // So we'll just use the hook directly
  const auth = useFirestoreAuth();
  
  return (
    <FirestoreAuthContext.Provider value={auth}>
      {children}
    </FirestoreAuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useFirestoreAuthContext = (): FirestoreAuthContextType => {
  const context = useContext(FirestoreAuthContext);
  
  if (context === undefined) {
    throw new Error('useFirestoreAuthContext must be used within a FirestoreAuthProvider');
  }
  
  return context;
};

// Combined provider that includes both Privy and Firestore
export const CombinedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <PrivyAuthProvider>
      <FirestoreAuthProvider>
        {children}
      </FirestoreAuthProvider>
    </PrivyAuthProvider>
  );
};
