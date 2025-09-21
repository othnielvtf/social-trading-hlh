import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

const App: React.FC = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Privy Authentication Test</h1>
        
        {authenticated ? (
          <div>
            <p className="mb-4">
              <span className="font-semibold">Logged in as:</span> {user?.email?.address || 'Anonymous User'}
            </p>
            <button
              onClick={logout}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4">You are not logged in.</p>
            <button
              onClick={login}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Log In with Privy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
