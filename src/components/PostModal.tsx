import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Globe, LogIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { usePrivyAuth } from '../contexts/PrivyAuthContext';

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
  const { isAuthenticated, user, login } = usePrivyAuth();

  const handleSubmit = () => {
    // In a real app, this would submit to your backend
    console.log('Posting:', { content, selectedTrade, userId: user?.id });
    
    // Reset form
    setContent('');
    setSelectedTrade(null);
    onClose();
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

              {/* Trading Activity Section */}
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Select a trade to add commentary:
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mockTradingActivity.map((trade) => (
                    <Card 
                      key={trade.id} 
                      className={`p-3 cursor-pointer transition-colors border ${
                        selectedTrade?.id === trade.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedTrade(selectedTrade?.id === trade.id ? null : trade)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              trade.type === 'long' 
                                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' 
                                : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
                            }`}
                          >
                            {trade.type === 'long' ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {trade.type.toUpperCase()}
                          </Badge>
                          <span className="text-sm">{trade.symbol}</span>
                          <span className="text-xs text-muted-foreground">{trade.timestamp}</span>
                        </div>
                        <div className={`text-sm ${trade.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.pnl > 0 ? '+' : ''}${Math.abs(trade.pnl).toLocaleString()}
                          <span className="text-xs ml-1">
                            ({trade.pnl > 0 ? '+' : ''}{trade.pnlPercent}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-2 text-xs text-muted-foreground">
                        <div>Entry: ${trade.entry.toLocaleString()}</div>
                        <div>Current: ${trade.current.toLocaleString()}</div>
                        <div>Size: {trade.size}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
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