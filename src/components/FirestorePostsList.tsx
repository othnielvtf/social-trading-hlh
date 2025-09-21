import React, { useState, useEffect } from 'react';
import { getPosts, getUserPosts, Post } from '../utils/firestore';
import { useFirestoreAuthContext } from '../contexts/FirestoreAuthContext';
import { Card } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Heart } from 'lucide-react';

interface FirestorePostsListProps {
  userId?: string;
  limit?: number;
}

export const FirestorePostsList: React.FC<FirestorePostsListProps> = ({ 
  userId, 
  limit = 10 
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, user } = useFirestoreAuthContext();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let fetchedPosts: Post[];
        
        if (userId) {
          // Get posts for a specific user
          fetchedPosts = await getUserPosts(userId);
        } else {
          // Get all posts
          fetchedPosts = await getPosts(limit);
        }
        
        setPosts(fetchedPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [userId, limit]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>{error}</p>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="p-6 text-center border border-border rounded-md bg-muted/30">
        <p className="text-muted-foreground">No posts found.</p>
        {isAuthenticated && !userId && (
          <p className="mt-2">Be the first to share your trading insights!</p>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FirestorePost key={post.id} post={post} />
      ))}
    </div>
  );
};

interface FirestorePostProps {
  post: Post;
}

export const FirestorePost: React.FC<FirestorePostProps> = ({ post }) => {
  const timestamp = post.timestamp 
    ? new Date(post.timestamp.seconds * 1000).toLocaleString()
    : 'Just now';
  
  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* User info */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <img 
              src={post.userAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face'} 
              alt={post.userName} 
              className="w-full h-full object-cover rounded-full"
            />
          </Avatar>
          <div>
            <div className="font-medium">{post.userName}</div>
            <div className="text-xs text-muted-foreground">{timestamp}</div>
          </div>
        </div>
        
        {/* Post content */}
        <p>{post.content}</p>
        
        {/* Trade info if available */}
        {post.trade && (
          <Card className="p-3 bg-accent/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline"
                  className={`text-xs ${
                    post.trade.type === 'long' 
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' 
                      : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
                  }`}
                >
                  {post.trade.type === 'long' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {post.trade.type.toUpperCase()}
                </Badge>
                <span className="font-medium">{post.trade.symbol}</span>
              </div>
              <div className={post.trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                {post.trade.pnl >= 0 ? '+' : ''}${Math.abs(post.trade.pnl).toFixed(0)} ({post.trade.pnlPercent.toFixed(1)}%)
              </div>
            </div>
          </Card>
        )}
        
        {/* Post stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <button className="hover:text-foreground flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {post.likes || 0}
          </button>
        </div>
      </div>
    </Card>
  );
};
