import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Globe, LogIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { useFirestoreAuthContext } from '../contexts/FirestoreAuthContext';
import { createPost } from '../utils/firestore';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock trading activity data
const mockTradingActivity = [
  {
    id: 1,
    symbol: 'BTC-USD',
    type: 'long' as const,
    entry: 42500,
    current: 45200,
    size: 1.5,
    pnl: 4050,
    pnlPercent: 6.35,
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    symbol: 'ETH-USD', 
    type: 'short' as const,
    entry: 2850,
    current: 2720,
    size: 10,
    pnl: 1300,
    pnlPercent: 4.56,
    timestamp: '5 hours ago'
  },
  {
    id: 3,
    symbol: 'SOL-USD',
    type: 'long' as const,
    entry: 98.50,
    current: 92.30,
    size: 50,
    pnl: -310,
    pnlPercent: -6.29,
    timestamp: '1 day ago'
  }
];

export function PostModal({ isOpen, onClose }: PostModalProps) {
  const [content, setContent] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<typeof mockTradingActivity[0] | null>(null);
  const { isAuthenticated, user, privyUser, login } = useFirestoreAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const instrumentOptions = [
    'BTC', 'BTC-PERPS',
    'HYPE', 'HYPE-PERPS',
    'SOL', 'SOL-PERPS',
    'ETH', 'ETH-PERPS',
  ];
  const [selectedInstrument, setSelectedInstrument] = useState<string>(instrumentOptions[0]);
  const [selectedDirection, setSelectedDirection] = useState<'long' | 'short'>('long');
  const [price, setPrice] = useState<string>('');
  const [size, setSize] = useState<string>('');

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to create a post');
      return;
    }
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    // Ensure a trade exists; if not, try to synthesize one from current inputs
    let tradeToAttach = selectedTrade;
    if (!tradeToAttach && price) {
      const parsedPrice = parseFloat(price);
      const parsedSize = parseFloat(size || '0');
      if (Number.isFinite(parsedPrice) && parsedPrice > 0) {
        tradeToAttach = {
          id: -1,
          symbol: selectedInstrument,
          type: selectedDirection,
          entry: parsedPrice,
          current: parsedPrice,
          size: Number.isFinite(parsedSize) ? parsedSize : 0,
          pnl: 0,
          pnlPercent: 0,
          timestamp: 'now'
        } as typeof mockTradingActivity[0];
      }
    }
    if (!tradeToAttach) {
      setError('Please attach a trade (instrument and price)');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const tradeObj: any = {
        symbol: tradeToAttach.symbol,
        type: tradeToAttach.type,
        entry: tradeToAttach.entry,
      };
      if (typeof tradeToAttach.size === 'number' && tradeToAttach.size > 0) {
        tradeObj.size = tradeToAttach.size;
      }
      const postData = {
        userId: user.id,
        userName: user.name || privyUser?.name || 'Anonymous User',
        userAvatar: user.avatar || privyUser?.avatar,
        content: content.trim(),
        trade: tradeObj,
      };
      const postId = await createPost(postData);
      if (!postId) {
        setError('Failed to create post. Please try again.');
        return;
      }
      // Reset
      setContent('');
      setSelectedTrade(null);
      onClose();
    } catch (e) {
      console.error('Error creating post from PostModal:', e);
      setError('An error occurred while creating your post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = content.trim().length > 0;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 gap-0">
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
          <div className="p-4 pr-16">
          {/* Main compose area */}
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

              {/* Manual Add: Instrument + Direction + Price */}
              <div className="space-y-3">
                <div className="mt-2 p-3 border border-border rounded-lg">
                  <div className="text-sm font-medium mb-2">Add a trade manually</div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Instrument</label>
                      <select
                        value={selectedInstrument}
                        onChange={(e) => setSelectedInstrument(e.target.value)}
                        className="mt-1 w-full border border-border rounded-md bg-background p-2 text-sm"
                      >
                        {instrumentOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={selectedDirection === 'long' ? 'default' : 'outline'}
                        className={selectedDirection === 'long' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                        onClick={() => setSelectedDirection('long')}
                        size="sm"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" /> Long
                      </Button>
                      <Button
                        type="button"
                        variant={selectedDirection === 'short' ? 'default' : 'outline'}
                        className={selectedDirection === 'short' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                        onClick={() => setSelectedDirection('short')}
                        size="sm"
                      >
                        <TrendingDown className="w-3 h-3 mr-1" /> Short
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.00000001"
                        placeholder="e.g. 42500"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 w-full border border-border rounded-md bg-background p-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Size (optional)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.00000001"
                        placeholder="e.g. 1.5"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="mt-1 w-full border border-border rounded-md bg-background p-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => {
                        const parsedPrice = parseFloat(price);
                        const parsedSize = parseFloat(size || '0');
                        if (!selectedInstrument || !Number.isFinite(parsedPrice) || parsedPrice <= 0) return;
                        setSelectedTrade({
                          id: -1,
                          symbol: selectedInstrument,
                          type: selectedDirection,
                          entry: parsedPrice,
                          current: parsedPrice,
                          size: Number.isFinite(parsedSize) ? parsedSize : 0,
                          pnl: 0,
                          pnlPercent: 0,
                          timestamp: 'now'
                        });
                      }}
                      size="sm"
                      className="rounded-full"
                    >
                      Attach
                    </Button>
                  </div>
                </div>
              </div>
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
            </div>
          </div>

          {/* Bottom toolbar */}
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {selectedTrade && (
                <span className="text-primary">
                  Adding commentary to {selectedTrade.symbol} trade
                </span>
              )}
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={!isValid || !selectedTrade}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
              size="sm"
            >
              Update
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}