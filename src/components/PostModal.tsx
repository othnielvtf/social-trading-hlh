import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, Globe, LogIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { useFirestoreAuthContext } from '../contexts/FirestoreAuthContext';
import { getUserPosts, type Post } from '../utils/firestore';
import { db } from '../config/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to format Firestore timestamps
function formatTs(ts?: any): string {
  try {
    const d: Date | null = ts && typeof ts.toDate === 'function' ? ts.toDate() : null;
    if (!d) return '';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  } catch { return ''; }
}

export function PostModal({ isOpen, onClose }: PostModalProps) {
  const [content, setContent] = useState('');
  const [selectedTradePost, setSelectedTradePost] = useState<Post | null>(null);
  const { isAuthenticated, user, privyUser, login } = useFirestoreAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradePosts, setTradePosts] = useState<Post[] | null>(null);
  const [loadingTrades, setLoadingTrades] = useState(false);

  // Load user's trade posts when modal opens
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isOpen || !isAuthenticated || !user?.id) return;
      try {
        setLoadingTrades(true);
        const posts = await getUserPosts(user.id);
        const withTrades = posts.filter(p => (p as any).trade);
        if (!cancelled) {
          setTradePosts(withTrades);
          setSelectedTradePost(withTrades[0] || null);
        }
      } catch {
        if (!cancelled) setTradePosts([]);
      } finally {
        if (!cancelled) setLoadingTrades(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, isAuthenticated, user?.id]);

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to create a post');
      return;
    }
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    if (!selectedTradePost?.id) {
      setError('Please select a trade to comment on');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Update the selected post's content with the new commentary
      const ref = doc(db, 'posts', selectedTradePost.id);
      await updateDoc(ref, { content: content.trim(), updatedAt: Timestamp.now() });
      // Reset
      setContent('');
      setSelectedTradePost(null);
      onClose();
    } catch (e) {
      console.error('Error creating post from PostModal:', e);
      setError('An error occurred while updating your trade.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = content.trim().length > 0;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] p-0 gap-0">
        <DialogTitle className="sr-only">Create Post</DialogTitle>
        <DialogDescription className="sr-only">
          Create a new post and optionally share your recent trading activity with your followers.
        </DialogDescription>
        
        {/* Authentication Check */}
        {!isAuthenticated ? (
          <div className="p-6 flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold mb-4">Authentication Required</h3>
            <p className="text-muted-foreground text-center mb-6">
              You need to be signed in to create posts and share your trading activity.
            </p>
            <Button 
              onClick={() => login()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-2"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        ) : (
          <div className="flex flex-col max-h-[80vh]">
            <div className="p-4 pr-16 grow overflow-y-auto">
              <div className="flex gap-3">
                <Avatar className="w-12 h-12">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={`${user.name}'s avatar`} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  )}
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea
                    placeholder="Add your thoughts about this trade..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px] resize-none border-none text-xl placeholder:text-muted-foreground focus:ring-0 p-3"
                  />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Select one of your trades</div>
                    <div className="max-h-56 overflow-y-auto space-y-2">
                      {loadingTrades ? (
                        <Card className="p-3"><div className="h-5 w-40 bg-accent/50 rounded animate-pulse" /></Card>
                      ) : !tradePosts || tradePosts.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No trades found. Execute a trade to start posting commentary.</div>
                      ) : (
                        tradePosts.map((p) => {
                          const t = (p as any).trade as { symbol?: string; type?: 'long'|'short'; entry?: number } | undefined;
                          if (!t) return null;
                          const selected = selectedTradePost?.id === p.id;
                          return (
                            <Card 
                              key={p.id} 
                              className={`p-3 cursor-pointer border ${selected ? 'border-primary' : 'border-border'} hover:bg-accent/40`}
                              onClick={() => setSelectedTradePost(p)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline"
                                    className={`text-xs ${t.type === 'long' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'}`}
                                  >
                                    {t.type?.toUpperCase()}
                                  </Badge>
                                  <span className="font-medium">{t.symbol}</span>
                                  {typeof t.entry === 'number' && (
                                    <span className="text-xs text-muted-foreground">entry ${t.entry.toLocaleString()}</span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{formatTs((p as any).timestamp)}</div>
                              </div>
                              {p.content ? (
                                <div className="mt-1 text-xs text-foreground/80 line-clamp-1">{p.content}</div>
                              ) : null}
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                  {error && (
                    <div className="text-sm text-destructive">{error}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {selectedTradePost && (
                  <span className="text-primary">
                    Adding commentary to {(selectedTradePost as any).trade?.symbol} trade
                  </span>
                )}
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={!isValid || !selectedTradePost}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
                size="sm"
              >
                Comment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}