import React, { useState } from 'react';
import { FirestorePostsList } from '../FirestorePostsList';
import { CreateFirestorePost } from '../CreateFirestorePost';
import { useFirestoreAuthContext } from '../../contexts/FirestoreAuthContext';
// Logo will be handled in the appropriate component

import { FeedTabs } from './home/FeedTabs';
import type { FeedTab } from './home/types';

interface HomeProps {
  onUserClick?: (userId: string) => void;
}

export function Home({ onUserClick }: HomeProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('for-you');
  const [refreshPosts, setRefreshPosts] = useState(0);
  const { isAuthenticated, user } = useFirestoreAuthContext();


  // Handle post creation success
  const handlePostCreated = () => {
    // Increment refresh counter to trigger FirestorePostsList to reload
    setRefreshPosts(prev => prev + 1);
  };

  return (
    <div className="min-h-screen">
      {/* Tab Navigation */}
      <FeedTabs activeTab={activeTab} onChange={setActiveTab} />
      
      {/* Create Post Form (only shown when authenticated) */}
      {isAuthenticated && (
        <CreateFirestorePost onPostCreated={handlePostCreated} />
      )}
      
      {/* Firestore Posts */}
      <div className="mb-4">
        <FirestorePostsList key={refreshPosts} mode={activeTab === 'friends' ? 'friends' : 'for-you'} />
      </div>
    </div>
  );
}