import React, { useState } from 'react';
import { TrendingUp, TrendingDown, UserPlus, Users } from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Trader {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFollowing: boolean;
  winRate: number;
  totalPnL: number;
  totalPnLPercent: number;
  followers: number;
  trades: number;
  recentTrades: Array<{
    symbol: string;
    pnl: number;
    pnlPercent: number;
    timestamp: string;
  }>;
}

const topTraders: Trader[] = [
  {
    id: '1',
    name: 'CryptoPro',
    username: 'crypto_pro_trader',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=40&h=40&fit=crop&crop=face',
    isFollowing: false,
    winRate: 78.5,
    totalPnL: 125430,
    totalPnLPercent: 245.2,
    followers: 15200,
    trades: 342,
    recentTrades: [
      { symbol: 'BTC-USD', pnl: 2340, pnlPercent: 5.2, timestamp: '2h' },
      { symbol: 'ETH-USD', pnl: 1200, pnlPercent: 3.1, timestamp: '5h' },
      { symbol: 'SOL-USD', pnl: -340, pnlPercent: -1.2, timestamp: '8h' }
    ]
  },
  {
    id: '2',
    name: 'Maria Santos',
    username: 'maria_trades',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    isFollowing: true,
    winRate: 82.1,
    totalPnL: 89650,
    totalPnLPercent: 178.9,
    followers: 8900,
    trades: 287,
    recentTrades: [
      { symbol: 'AVAX-USD', pnl: 890, pnlPercent: 4.2, timestamp: '1h' },
      { symbol: 'MATIC-USD', pnl: 560, pnlPercent: 2.8, timestamp: '4h' }
    ]
  },
  {
    id: '3',
    name: 'DeFi Master',
    username: 'defi_master',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    isFollowing: false,
    winRate: 75.3,
    totalPnL: 67890,
    totalPnLPercent: 156.7,
    followers: 12500,
    trades: 198,
    recentTrades: [
      { symbol: 'UNI-USD', pnl: 1200, pnlPercent: 6.1, timestamp: '3h' },
      { symbol: 'AAVE-USD', pnl: -200, pnlPercent: -0.8, timestamp: '6h' }
    ]
  },
  {
    id: '4',
    name: 'Jake Thompson',
    username: 'jake_crypto',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    isFollowing: false,
    winRate: 71.8,
    totalPnL: 45230,
    totalPnLPercent: 112.4,
    followers: 6800,
    trades: 156,
    recentTrades: [
      { symbol: 'DOT-USD', pnl: 750, pnlPercent: 3.8, timestamp: '2h' },
      { symbol: 'ADA-USD', pnl: 420, pnlPercent: 2.1, timestamp: '5h' }
    ]
  },
  {
    id: '5',
    name: 'Lisa Wang',
    username: 'lisa_defi',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    isFollowing: true,
    winRate: 69.2,
    totalPnL: 38790,
    totalPnLPercent: 98.7,
    followers: 5400,
    trades: 134,
    recentTrades: [
      { symbol: 'LINK-USD', pnl: 680, pnlPercent: 4.2, timestamp: '1h' },
      { symbol: 'XRP-USD', pnl: -150, pnlPercent: -0.9, timestamp: '7h' }
    ]
  }
];

const friendsData: Trader[] = [
  {
    id: 'f1',
    name: 'Alex Chen',
    username: 'alexchen_trades',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    isFollowing: true,
    winRate: 68.4,
    totalPnL: 12340,
    totalPnLPercent: 34.5,
    followers: 245,
    trades: 89,
    recentTrades: [
      { symbol: 'ETH-USD', pnl: 185, pnlPercent: 1.57, timestamp: '2h' }
    ]
  },
  {
    id: 'f2',
    name: 'Sarah Kim',
    username: 'crypto_sarah',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
    isFollowing: true,
    winRate: 72.1,
    totalPnL: 8970,
    totalPnLPercent: 28.9,
    followers: 189,
    trades: 67,
    recentTrades: [
      { symbol: 'BTC-USD', pnl: 1400, pnlPercent: 3.24, timestamp: '4h' }
    ]
  }
];

export function Explore() {
  const [activeTab, setActiveTab] = useState('top-traders');

  return (
    <div className="h-screen flex flex-col">

      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start bg-transparent p-0 h-auto">
                <TabsTrigger value="friends" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground rounded-none py-2 px-4 hover:bg-accent/50">
                  My friends
                </TabsTrigger>
                <TabsTrigger value="top-traders" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground rounded-none py-2 px-4 hover:bg-accent/50">
                  Top traders
                </TabsTrigger>
                <TabsTrigger value="hype-maxi" disabled className="opacity-50 cursor-not-allowed text-muted-foreground rounded-none py-2 px-4">
                  $HYPE MAXI
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" alt="Your profile" />
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="font-medium">Sarah Johnson</span>
                <span className="text-muted-foreground">@sarahj</span>
                <span className="text-green-500 font-medium">+$2,340</span>
                <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">me</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">24h</Button>
              <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">7d</Button>
              <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">30d</Button>
              <Button variant="secondary" size="sm">All</Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="top-traders">
              <div className="space-y-4">

                {topTraders.map((trader, index) => (
                  <TraderCard key={trader.id} trader={trader} rank={index + 1} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="friends">
              <div className="space-y-4">

                {friendsData.map((trader, index) => (
                  <TraderCard key={trader.id} trader={trader} rank={index + 1} showRank={false} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function TraderCard({ trader, rank, showRank = true }: { trader: Trader; rank: number; showRank?: boolean }) {
  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showRank && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-muted text-muted-foreground">
              {rank}
            </div>
          )}
          <Avatar className="w-10 h-10">
            <img src={trader.avatar} alt={trader.name} className="w-full h-full object-cover rounded-full" />
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{trader.name}</h4>
              <span className="text-muted-foreground text-sm">@{trader.username}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className={`font-medium ${
                trader.totalPnLPercent > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                +${trader.totalPnL.toLocaleString()}
              </span>
              <span className="text-muted-foreground">{trader.winRate}% win rate</span>
            </div>
          </div>
        </div>
        
        <Button
          variant={trader.isFollowing ? "secondary" : "default"}
          size="sm"
        >
          {trader.isFollowing ? "Following" : "Follow"}
        </Button>
      </div>
    </Card>
  );
}