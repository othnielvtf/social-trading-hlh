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
  const instrumentOptions = [
    'BTC', 'BTC-PERPS',
    'HYPE', 'HYPE-PERPS',
    'SOL', 'SOL-PERPS',
    'ETH', 'ETH-PERPS',
  ];
  const [tradeInstrument, setTradeInstrument] = useState<string>(instrumentOptions[0]);
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long');
  const [tradePrice, setTradePrice] = useState('');
  const [tradeSize, setTradeSize] = useState('');
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
        ...(isAddingTrade && tradePrice ? (() => {
          const priceNum = parseFloat(tradePrice);
          const sizeNum = parseFloat(tradeSize || '');
          if (!Number.isFinite(priceNum) || priceNum <= 0) return {};
          const trade: any = {
            symbol: tradeInstrument,
            type: tradeType,
            entry: priceNum,
          };
          if (Number.isFinite(sizeNum) && sizeNum > 0) {
            trade.size = sizeNum;
          }
          return { trade };
        })() : {})
      };
      
      const postId = await createPost(postData);
      
      if (postId) {
        // Reset form
        setContent('');
        setIsAddingTrade(false);
        setTradeInstrument(instrumentOptions[0]);
        setTradeType('long');
        setTradePrice('');
        setTradeSize('');
        
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <select
                    value={tradeInstrument}
                    onChange={(e) => setTradeInstrument(e.target.value)}
                    className="px-3 py-1 rounded-md border border-border bg-background"
                  >
                    {instrumentOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-pressed={tradeType === 'long'}
                      onClick={() => setTradeType('long')}
                      className={`px-4 py-1.5 rounded-full font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-400 ring-offset-background ${
                        tradeType === 'long'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-green-600/80 text-white hover:bg-green-600/90 opacity-80'
                      }`}
                      style={{ backgroundColor: tradeType === 'long' ? '#16a34a' : 'rgba(22,163,74,0.8)' }}
                    >
                      <span className="inline-flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> Long</span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={tradeType === 'short'}
                      onClick={() => setTradeType('short')}
                      className={`px-4 py-1.5 rounded-full font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400 ring-offset-background ${
                        tradeType === 'short'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-red-600/80 text-white hover:bg-red-600/90 opacity-80'
                      }`}
                      style={{ backgroundColor: tradeType === 'short' ? '#dc2626' : 'rgba(220,38,38,0.8)' }}
                    >
                      <span className="inline-flex items-center"><TrendingDown className="w-4 h-4 mr-1" /> Short</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    placeholder="Price"
                    value={tradePrice}
                    onChange={(e) => setTradePrice(e.target.value)}
                    className="px-3 py-1 rounded-md border border-border bg-background"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Size (optional)"
                    value={tradeSize}
                    onChange={(e) => setTradeSize(e.target.value)}
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
