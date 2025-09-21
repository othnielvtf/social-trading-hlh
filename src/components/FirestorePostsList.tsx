import React, { useState, useEffect, useMemo } from 'react';
import { getPosts, getUserPosts, Post, getFollowingIds } from '../utils/firestore';
import { useFirestoreAuthContext } from '../contexts/FirestoreAuthContext';
import { Card } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Heart } from 'lucide-react';
import { fetchAllMids } from '../utils/hyperliquid';

interface FirestorePostsListProps {
  userId?: string;
  limit?: number;
  mode?: 'for-you' | 'friends';
}

export const FirestorePostsList: React.FC<FirestorePostsListProps> = ({ 
  userId, 
  limit = 10,
  mode = 'for-you',
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, user } = useFirestoreAuthContext();
  const [followingIds, setFollowingIds] = useState<string[] | null>(null);

  // Load following IDs (used for friends filter and for-you sorting)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) { setFollowingIds([]); return; }
      try {
        const list = await getFollowingIds(user.id);
        if (!cancelled) setFollowingIds(list);
      } catch {
        if (!cancelled) setFollowingIds([]);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let fetchedPosts: Post[];
        if (userId) {
          fetchedPosts = await getUserPosts(userId);
        } else {
          fetchedPosts = await getPosts(limit);
        }
        if (mode === 'friends') {
          const fset = new Set(followingIds || []);
          fetchedPosts = fetchedPosts.filter(p => fset.has(p.userId));
        } else if (mode === 'for-you' && followingIds) {
          const fset = new Set(followingIds);
          // stable followed-first: split then concat
          const followed = fetchedPosts.filter(p => fset.has(p.userId));
          const others = fetchedPosts.filter(p => !fset.has(p.userId));
          fetchedPosts = [...followed, ...others];
        }
        setPosts(fetchedPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Wait for followingIds in both modes to apply filtering/sorting
    if (followingIds === null) return;
    fetchPosts();
  }, [userId, limit, mode, followingIds]);
  
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
  const [mids, setMids] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchAllMids('');
        if (cancelled) return;
        const m: Record<string, number> = {};
        Object.entries(res || {}).forEach(([k, v]) => {
          const num = parseFloat(v as string);
          if (!Number.isNaN(num)) {
            m[k] = num;           // keep symbol or @id
            if (k.startsWith('@')) m[k.slice(1)] = num; // also store id-only
          }
        });
        // Stablecoins
        m['USDC'] = 1;
        setMids(m);
      } catch (e) {
        // ignore errors in feed mids fetch
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const computed = useMemo(() => {
    const t = post.trade;
    if (!t || typeof t.entry !== 'number' || !mids) return null;
    const symbol = t.symbol || '';
    const base = symbol.replace(/-PERPS?$/i, '');
    const mid = mids[symbol] ?? mids[base] ?? mids[`@${symbol}`] ?? 0;
    if (!mid || !t.entry) return null;
    // percent change relative to entry; invert for short
    const rawPct = ((mid - t.entry) / t.entry) * 100;
    const pct = t.type === 'short' ? -rawPct : rawPct;
    return { pct, mid };
  }, [post.trade, mids]);
  
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
                  className={`text-xs font-medium border-transparent ${
                    post.trade.type === 'long' 
                      ? 'bg-green-600 text-white dark:bg-green-500 dark:text-black' 
                      : 'bg-red-600 text-white dark:bg-red-500 dark:text-black'
                  }`}
                >
                  {post.trade.type === 'long' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {post.trade.type.toUpperCase()}
                </Badge>
                <span className="font-medium">{post.trade.symbol}</span>
              </div>
              {typeof post.trade?.pnl === 'number' && typeof post.trade?.pnlPercent === 'number' ? (
                <div className={post.trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {post.trade.pnl >= 0 ? '+' : ''}${Math.abs(post.trade.pnl).toFixed(0)} ({post.trade.pnlPercent.toFixed(1)}%)
                  {(typeof post.trade.entry === 'number' || (typeof post.trade.size === 'number' && post.trade.size > 0)) && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {typeof post.trade.entry === 'number' ? `Entry: $${post.trade.entry.toLocaleString()}` : ''}
                      {typeof post.trade.size === 'number' && post.trade.size > 0 ? (
                        <span className="ml-2">Size: {post.trade.size}</span>
                      ) : null}
                    </span>
                  )}
                </div>
              ) : computed ? (
                <div className={`${computed.pct >= 0 ? 'text-green-600' : 'text-red-600'} text-sm`}>
                  ({computed.pct >= 0 ? '+' : ''}{computed.pct.toFixed(2)}%)
                  <span className="text-muted-foreground ml-2">
                    Entry: {typeof post.trade.entry === 'number' ? `$${post.trade.entry.toLocaleString()}` : '—'}
                    <span className="ml-2">Current: ${computed.mid.toLocaleString()}</span>
                    {typeof post.trade.size === 'number' && post.trade.size > 0 ? (
                      <span className="ml-2">Size: {post.trade.size}</span>
                    ) : null}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Entry: {typeof post.trade.entry === 'number' ? `$${post.trade.entry.toLocaleString()}` : '—'}
                  {typeof post.trade.size === 'number' && post.trade.size > 0 ? (
                    <span className="ml-2">Size: {post.trade.size}</span>
                  ) : null}
                </div>
              )}
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
