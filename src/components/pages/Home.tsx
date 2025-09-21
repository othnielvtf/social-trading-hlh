import React, { useState } from 'react';
import { TrendingUp, TrendingDown, MessageCircle, Heart, Repeat2, MoreHorizontal, BarChart3, Share, Bookmark } from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { TradingModal } from '../TradingModal';
import { FirestorePostsList } from '../FirestorePostsList';
import { CreateFirestorePost } from '../CreateFirestorePost';
import { useFirestoreAuthContext } from '../../contexts/FirestoreAuthContext';
import logo from 'figma:asset/3b6b6989c883cf7a1df8e0e06c02313092c7c538.png';

interface TradingPost {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    isFollowing: boolean;
  };
  tradeActivity?: {
    type: 'buy' | 'sell' | 'close' | 'profit' | 'loss';
    amount?: string;
    asset: string;
    pnl?: string;
  };
  timestamp: string;
  content: string;
  trade?: {
    symbol: string;
    type: 'long' | 'short';
    entry: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
    size: number;
  };
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
}

const mockPosts: TradingPost[] = [
  {
    id: '1',
    user: {
      name: 'Alex Chen',
      username: 'alexchen_trades',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      isFollowing: true
    },
    tradeActivity: { type: 'buy', amount: '$2K', asset: 'BTC' },
    timestamp: '2h',
    content: 'Just bought BTC on this dip. Dollar cost averaging strategy is working well so far. Perfect entry point! 🚀',
    trade: {
      symbol: 'BTC-USD',
      type: 'long',
      entry: 42000,
      currentPrice: 42150,
      pnl: 71,
      pnlPercent: 0.36,
      size: 2000
    },
    likes: 24,
    comments: 8,
    reposts: 3,
    isLiked: false
  },
  {
    id: '2',
    user: {
      name: 'Sarah Kim',
      username: 'crypto_sarah',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
      isFollowing: false
    },
    tradeActivity: { type: 'sell', amount: '$5K', asset: 'ETH' },
    timestamp: '4h',
    content: 'Taking profits on ETH at these levels. Market looking overheated, better to secure gains now.',
    trade: {
      symbol: 'ETH-USD',
      type: 'long',
      entry: 2250,
      currentPrice: 2387,
      pnl: 304,
      pnlPercent: 6.09,
      size: 5000
    },
    likes: 67,
    comments: 15,
    reposts: 12,
    isLiked: true
  },
  {
    id: '3',
    user: {
      name: 'Mike Rodriguez',
      username: 'miketrading',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      isFollowing: true
    },
    tradeActivity: { type: 'close', asset: 'BTC' },
    timestamp: '6h',
    content: 'Closed my BTC position. Market structure changed, time to reassess. Always follow your plan!',
    trade: {
      symbol: 'BTC-USD',
      type: 'long',
      entry: 41800,
      currentPrice: 42150,
      pnl: 175,
      pnlPercent: 0.84,
      size: 5000
    },
    likes: 31,
    comments: 7,
    reposts: 5,
    isLiked: false
  },
  {
    id: '4',
    user: {
      name: 'Jessica Park',
      username: 'jess_crypto',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      isFollowing: true
    },
    tradeActivity: { type: 'profit', pnl: '$50,120.30', asset: 'SOL' },
    timestamp: '1h',
    content: 'SOL has been incredible! This bull run exceeded all expectations. Still holding for higher targets 📈',
    trade: {
      symbol: 'SOL-USD',
      type: 'long',
      entry: 85,
      currentPrice: 118,
      pnl: 50120,
      pnlPercent: 38.82,
      size: 15000
    },
    likes: 142,
    comments: 23,
    reposts: 18,
    isLiked: false
  },
  {
    id: '5',
    user: {
      name: 'David Chen',
      username: 'davidtrader',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      isFollowing: false
    },
    tradeActivity: { type: 'loss', pnl: '$23,102.39', asset: 'ETH' },
    timestamp: '3h',
    content: 'Tough lesson learned on this ETH trade. Market can be humbling. Risk management failed me this time.',
    trade: {
      symbol: 'ETH-USD',
      type: 'long',
      entry: 2450,
      currentPrice: 2127,
      pnl: -23102,
      pnlPercent: -13.18,
      size: 25000
    },
    likes: 89,
    comments: 34,
    reposts: 7,
    isLiked: false
  }
];

type FeedTab = 'for-you' | 'friends' | 'on-chain';

interface HomeProps {
  onUserClick?: (userId: string) => void;
}

export function Home({ onUserClick }: HomeProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('for-you');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(0);
  const { isAuthenticated, user } = useFirestoreAuthContext();

  const tabs = [
    { id: 'for-you' as FeedTab, label: 'For you' },
    { id: 'friends' as FeedTab, label: 'Friends' },
    { id: 'on-chain' as FeedTab, label: 'On-chain' },
  ];

  // Filter posts based on active tab (in real app, this would fetch different data)
  const getFilteredPosts = () => {
    switch (activeTab) {
      case 'friends':
        return mockPosts.filter(post => post.user.isFollowing);
      case 'on-chain':
        return mockPosts.filter(post => ['crypto_pro_trader', 'defi_master'].includes(post.user.username));
      default:
        return mockPosts;
    }
  };

  // Handle post creation success
  const handlePostCreated = () => {
    // Increment refresh counter to trigger FirestorePostsList to reload
    setRefreshPosts(prev => prev + 1);
  };

  return (
    <div className="min-h-screen">
      {/* Tab Navigation */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-4 text-center relative font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <span className="text-[15px] text-muted-foreground">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Create Post Form (only shown when authenticated) */}
      {isAuthenticated && (
        <CreateFirestorePost onPostCreated={handlePostCreated} />
      )}
      
      {/* Firestore Posts */}
      <div className="mb-4">
        <FirestorePostsList key={refreshPosts} />
      </div>
      
      {/* Legacy Feed - Can be removed once Firestore integration is complete */}
      <div className="border-t border-border pt-4 mt-4">
        <h2 className="text-lg font-semibold px-4 mb-2">Sample Posts</h2>
        {getFilteredPosts().map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            setIsTradeModalOpen={setIsTradeModalOpen}
            onUserClick={onUserClick}
          />
        ))}
      </div>

      {/* Trading Modal */}
      <TradingModal 
        isOpen={isTradeModalOpen} 
        onClose={() => setIsTradeModalOpen(false)} 
      />
    </div>
  );
}

function PostCard({ post, setIsTradeModalOpen, onUserClick }: { 
  post: TradingPost; 
  setIsTradeModalOpen: (open: boolean) => void;
  onUserClick?: (userId: string) => void;
}) {
  return (
    <div className="border-b border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex gap-3">
        <Avatar 
          className="w-10 h-10 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onUserClick && onUserClick(post.user.username);
          }}
        >
          <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover rounded-full" />
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[15px]">
              <span className="font-bold">{post.user.name}</span>
              <span className="text-muted-foreground"> @{post.user.username}</span>
              {(() => {
                const activity = post.tradeActivity || { type: 'buy', amount: '2K', asset: 'BTC' }; // fallback data
                switch(activity.type) {
                  case 'buy':
                    return (
                      <>
                        {' '}
                        <span className="text-green-600">bought</span>
                        {` ${activity.amount} ${activity.asset}`}
                      </>
                    );
                  case 'sell':
                    return (
                      <>
                        {' '}
                        <span className="text-red-600">sold</span>
                        {` ${activity.amount} ${activity.asset}`}
                      </>
                    );
                  case 'close':
                    return ` closed ${activity.asset} position`;
                  case 'profit':
                    return (
                      <>
                        {' is '}
                        up <span className="text-green-600">+{activity.pnl}</span>
                        {` on ${activity.asset}`}
                      </>
                    );
                  case 'loss':
                    return (
                      <>
                        {' is '}
                        down <span className="text-red-600">-{activity.pnl}</span>
                        {` on ${activity.asset}`}
                      </>
                    );
                  default:
                    return (
                      <>
                        {' '}
                        <span className="text-green-600">bought</span>
                        {` ${activity.amount} ${activity.asset}`}
                      </>
                    );
                }
              })()}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground text-[15px]">{post.timestamp}</span>
            {post.user.isFollowing && (
              <Badge variant="secondary" className="text-xs ml-2">Following</Badge>
            )}
          </div>
          
          <p className="text-[15px] leading-5 mb-3">{post.content}</p>
          
          {post.trade && (
            <Card className="p-3 mb-3 bg-accent/30 border border-border rounded-2xl">
              {(() => {
                const activity = post.tradeActivity;
                const getAssetLogo = (asset: string) => {
                  const colors = {
                    'BTC': '#f7931a',
                    'ETH': '#627eea', 
                    'SOL': '#9945ff'
                  };
                  return (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: colors[asset] || '#666' }}
                    >
                      {asset}
                    </div>
                  );
                };

                if (activity?.type === 'buy' || activity?.type === 'sell') {
                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getAssetLogo(activity.asset)}
                        <span className="font-medium">{activity.asset}</span>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-muted-foreground">Entry ${post.trade.entry.toLocaleString()}</div>
                        <div>Size ${post.trade.size.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                }

                if (activity?.type === 'profit' || activity?.type === 'loss') {
                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getAssetLogo(activity.asset)}
                        <span className="font-medium">{activity.asset}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          post.trade.pnlPercent > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {post.trade.pnlPercent > 0 ? '+' : ''}${post.trade.pnl.toLocaleString()}
                        </div>
                        <div className={`text-sm ${
                          post.trade.pnlPercent > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {post.trade.pnlPercent > 0 ? '+' : ''}{post.trade.pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                }

                if (activity?.type === 'close') {
                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getAssetLogo(activity.asset)}
                        <span className="font-medium">{activity.asset}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          post.trade.pnlPercent > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {post.trade.pnlPercent > 0 ? '+' : ''}${post.trade.pnl.toLocaleString()}
                        </div>
                        <div className={`text-sm ${
                          post.trade.pnlPercent > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {post.trade.pnlPercent > 0 ? '+' : ''}{post.trade.pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                }

                // Fallback to original layout if no activity type matches
                return (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAssetLogo('BTC')}
                      <span className="font-medium">BTC</span>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">$42,000</div>
                      <div>$2,000</div>
                    </div>
                  </div>
                );
              })()}
            </Card>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-full p-2 flex items-center ${
                post.isLiked 
                  ? 'text-green-500 hover:bg-green-500/10' 
                  : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span className="ml-0.5 text-xs">{post.likes}</span>
            </Button>

            <Button 
              variant="default" 
              size="sm"
              onClick={() => setIsTradeModalOpen(true)}
              className="bg-muted hover:bg-secondary text-foreground px-4 py-2 rounded-full ml-auto"
            >
              Trade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}