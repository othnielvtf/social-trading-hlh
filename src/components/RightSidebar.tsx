import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, UserPlus, MoreHorizontal, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { getAllUsers, UserData, followUser, unfollowUser, getFollowingIds } from '../utils/firestore';
import { useFirestoreAuthContext } from '../contexts/FirestoreAuthContext';

interface TopTrader {
  id: string;
  name: string;
  username: string;
  avatar: string;
  todayPnL: number;
  todayPnLPercent: number;
  isFollowing: boolean;
}

interface MarketVolume {
  symbol: string;
  volume: number;
  change24h: number;
  price: number;
}

interface SuggestedTrader {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  winRate: number;
  isFollowing: boolean;
}

const topTradersToday: TopTrader[] = [
  {
    id: '1',
    name: 'CryptoPro',
    username: 'crypto_pro_trader',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=32&h=32&fit=crop&crop=face',
    todayPnL: 15420,
    todayPnLPercent: 8.2,
    isFollowing: false
  },
  {
    id: '2',
    name: 'DeFi Master',
    username: 'defi_master',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
    todayPnL: 12890,
    todayPnLPercent: 6.4,
    isFollowing: true
  },
  {
    id: '3',
    name: 'Maria Santos',
    username: 'maria_trades',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
    todayPnL: 9340,
    todayPnLPercent: 5.1,
    isFollowing: false
  }
];

const topVolumeMarkets: MarketVolume[] = [
  {
    symbol: 'BTC-USD',
    volume: 28500000000,
    change24h: 2.01,
    price: 43200
  },
  {
    symbol: 'ETH-USD',
    volume: 12800000000,
    change24h: -1.85,
    price: 2387
  },
  {
    symbol: 'SOL-USD',
    volume: 1200000000,
    change24h: 2.93,
    price: 112.45
  }
];

const suggestedTraders: SuggestedTrader[] = [
  {
    id: '1',
    name: 'Sarah Kim',
    username: 'crypto_sarah',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face',
    followers: 2890,
    winRate: 76.4,
    isFollowing: false
  },
  {
    id: '2',
    name: 'Alex Rodriguez',
    username: 'alexr_crypto',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    followers: 2340,
    winRate: 74.2,
    isFollowing: false
  },
  {
    id: '3',
    name: 'Jessica Liu',
    username: 'jessica_defi',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face',
    followers: 1890,
    winRate: 68.9,
    isFollowing: false
  }
];

type Page = 'home' | 'explore' | 'portfolio' | 'trade' | 'profile';

interface RightSidebarProps {
  currentPage: Page;
  onUserClick?: (userId: string) => void;
}

export function RightSidebar({ currentPage, onUserClick }: RightSidebarProps) {
  // Hide content on Portfolio page
  if (currentPage === 'portfolio') {
    return null;
  }

  const { user: currentUser } = useFirestoreAuthContext();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const [loadingFollow, setLoadingFollow] = useState<Record<string, boolean>>({});
  useEffect(() => {
    (async () => {
      setLoadingUsers(true);
      const list = await getAllUsers(50);
      setUsers(list);
      setLoadingUsers(false);
    })();
  }, []);

  // Initialize following set from Firestore so it persists across refreshes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!currentUser?.id) return;
      try {
        const ids = await getFollowingIds(currentUser.id);
        if (!cancelled) setFollowingSet(new Set(ids));
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  return (
    <div className="w-80 p-4 space-y-4 sticky top-0 h-screen overflow-y-auto">
      {/* Top Traders Today */}
      <Card className="overflow-hidden">
        <div className="p-4 pb-0">
          <h3 className="text-lg">Top Traders Today</h3>
        </div>
        <div className="divide-y divide-border">
          {topTradersToday.map((trader) => (
            <div 
              key={trader.id} 
              className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => onUserClick && onUserClick(trader.username)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <img src={trader.avatar} alt={trader.name} className="w-full h-full object-cover rounded-full" />
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm truncate">{trader.name}</div>
                    <div className="text-xs text-muted-foreground truncate">@{trader.username}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 text-sm">
                    +${trader.todayPnL.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600">
                    +{trader.todayPnLPercent}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 pt-0">
          <button className="text-primary text-xs hover:underline">
            Show more
          </button>
        </div>
      </Card>

      {/* Top Volume Markets */}
      <Card className="overflow-hidden">
        <div className="p-4 pb-0">
          <h3 className="text-lg">Trending</h3>
        </div>
        <div className="divide-y divide-border">
          {topVolumeMarkets.map((market, index) => (
            <div key={market.symbol} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm">{market.symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    ${(market.volume / 1000000000).toFixed(1)}B volume
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">${market.price.toLocaleString()}</div>
                  <div className={`text-xs ${market.change24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {market.change24h > 0 ? '+' : ''}{market.change24h}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 pt-0">
          <button className="text-primary text-xs hover:underline">
            Show more
          </button>
        </div>
      </Card>

      {/* Who to Follow */}
      <Card className="overflow-hidden">
        <div className="p-4 pb-0">
          <h3 className="text-lg">Who to follow</h3>
        </div>
        <div className="divide-y divide-border">
          {loadingUsers ? (
            <div className="p-4 text-sm text-muted-foreground">Loading users…</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No users found.</div>
          ) : (
            users
              .filter(u => !currentUser || u.id !== currentUser.id)
              .map((u) => (
                <div key={u.id} className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => onUserClick && onUserClick(u.id)}
                    >
                      <Avatar className="w-10 h-10">
                        <img src={u.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&s=64'} alt={u.name || u.username} className="w-full h-full object-cover rounded-full" />
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm truncate">{u.name || u.username}</div>
                        <div className="text-xs text-muted-foreground truncate">@{u.username}</div>
                      </div>
                    </div>
                    {u.id === currentUser?.id ? null : (
                    <Button 
                      size="sm" 
                      variant={followingSet.has(u.id) ? 'default' : 'outline'} 
                      className="shrink-0 text-xs"
                      disabled={!!loadingFollow[u.id]}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!currentUser?.id) return;
                        setLoadingFollow(prev => ({ ...prev, [u.id]: true }));
                        if (followingSet.has(u.id)) {
                          // Unfollow
                          const ok = await unfollowUser(currentUser.id, u.id);
                          if (ok) {
                            setFollowingSet(prev => { const s = new Set(prev); s.delete(u.id); return s; });
                            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, followers: Math.max(0, (x.followers || 0) - 1) } as UserData : x));
                            window.dispatchEvent(new CustomEvent('follow-changed'));
                          }
                        } else {
                          // Follow
                          const ok = await followUser(currentUser.id, u.id);
                          if (ok) {
                            setFollowingSet(prev => new Set(prev).add(u.id));
                            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, followers: (x.followers || 0) + 1 } as UserData : x));
                            window.dispatchEvent(new CustomEvent('follow-changed'));
                          }
                        }
                        setLoadingFollow(prev => ({ ...prev, [u.id]: false }));
                      }}
                    >
                      {loadingFollow[u.id] ? (
                        <span className="inline-flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {followingSet.has(u.id) ? 'Updating' : 'Following'}
                        </span>
                      ) : (
                        followingSet.has(u.id) ? 'Following' : 'Follow'
                      )}
                    </Button>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
        <div className="p-4 pt-0">
          <button className="text-primary text-xs hover:underline">
            Show more
          </button>
        </div>
      </Card>


    </div>
  );
}