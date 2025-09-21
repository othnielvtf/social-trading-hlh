import React, { useState } from 'react';
import { createPost } from '../utils/firestore';
import { useFirestoreAuthContext } from '../contexts/FirestoreAuthContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';

interface CreateFirestorePostProps {
  onPostCreated?: () => void;
}

export const CreateFirestorePost: React.FC<CreateFirestorePostProps> = ({ 
  onPostCreated 
}) => {
  const [content, setContent] = useState('');
  const [isAddingTrade, setIsAddingTrade] = useState(false);
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long');
  const [tradePnl, setTradePnl] = useState('');
  const [tradePnlPercent, setTradePnlPercent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, user, privyUser } = useFirestoreAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setError('You must be logged in to create a post');
      return;
    }
    
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const postData = {
        userId: user.id,
        userName: user.name || privyUser?.name || 'Anonymous User',
        userAvatar: user.avatar || privyUser?.avatar,
        content: content.trim(),
        ...(isAddingTrade && tradeSymbol.trim() && tradePnl && tradePnlPercent ? {
          trade: {
            symbol: tradeSymbol.trim().toUpperCase(),
            type: tradeType,
            pnl: parseFloat(tradePnl),
            pnlPercent: parseFloat(tradePnlPercent)
          }
        } : {})
      };
      
      const postId = await createPost(postData);
      
      if (postId) {
        // Reset form
        setContent('');
        setIsAddingTrade(false);
        setTradeSymbol('');
        setTradeType('long');
        setTradePnl('');
        setTradePnlPercent('');
        
        // Notify parent component
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        setError('Failed to create post. Please try again.');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('An error occurred while creating your post.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Card className="p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="w-10 h-10">
            <img 
              src={user?.avatar || privyUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face'} 
              alt={user?.name || 'User'} 
              className="w-full h-full object-cover rounded-full"
            />
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Share your trading insights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none mb-2"
              rows={3}
            />
            
            {isAddingTrade && (
              <div className="mb-4 p-3 bg-accent/30 rounded-md">
                <div className="text-sm font-medium mb-2">Add Trade Details</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Symbol (e.g., BTC-USD)"
                    value={tradeSymbol}
                    onChange={(e) => setTradeSymbol(e.target.value)}
                    className="px-3 py-1 rounded-md border border-border bg-background"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={tradeType === 'long' ? 'default' : 'outline'}
                      size="sm"
                      className={tradeType === 'long' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => setTradeType('long')}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Long
                    </Button>
                    <Button
                      type="button"
                      variant={tradeType === 'short' ? 'default' : 'outline'}
                      size="sm"
                      className={tradeType === 'short' ? 'bg-red-600 hover:bg-red-700' : ''}
                      onClick={() => setTradeType('short')}
                    >
                      <TrendingDown className="w-4 h-4 mr-1" />
                      Short
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="P&L ($)"
                    value={tradePnl}
                    onChange={(e) => setTradePnl(e.target.value)}
                    className="px-3 py-1 rounded-md border border-border bg-background"
                  />
                  <input
                    type="number"
                    placeholder="P&L (%)"
                    value={tradePnlPercent}
                    onChange={(e) => setTradePnlPercent(e.target.value)}
                    className="px-3 py-1 rounded-md border border-border bg-background"
                  />
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-destructive mb-2">{error}</div>
            )}
            
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingTrade(!isAddingTrade)}
              >
                {isAddingTrade ? 'Remove Trade' : 'Add Trade'}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                size="sm"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};
