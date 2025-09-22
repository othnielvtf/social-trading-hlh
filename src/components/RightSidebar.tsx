import React, { useEffect, useState } from 'react';
import { fetchAllMids } from '../utils/hyperliquid';
import { TrendingUp, TrendingDown, UserPlus, MoreHorizontal, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { getAllUsers, UserData, followUser, unfollowUser, getFollowingIds, getTopTradersByTradeCountToday, TraderTradeCount } from '../utils/firestore';
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

// Top traders will be computed from Firestore by trade count today

const trending = [
  { symbol: 'BTC-USD', name: 'Bitcoin', price: 42150, change: 0.36 },
  { symbol: 'ETH-USD', name: 'Ethereum', price: 2387, change: -1.24 },
  { symbol: 'SOL-USD', name: 'Solana', price: 118, change: 5.67 },
  { symbol: 'HYPE-USD', name: 'Hyperliquid', price: 35.42, change: 2.18 },
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
  const [mids, setMids] = useState<Record<string, number> | null>(null);
  const [topTraders, setTopTraders] = useState<TraderTradeCount[] | null>(null);
  const [loadingTop, setLoadingTop] = useState(true);

  // Map a UI symbol like BTC-USD to Hyperliquid PERP name
  const mapToPerp = (symbol: string) => symbol.endsWith('-USD') ? symbol.replace('-USD', '-PERP') : symbol;

  useEffect(() => {
    (async () => {
      setLoadingUsers(true);
      const list = await getAllUsers(50);
      setUsers(list);
      setLoadingUsers(false);
    })();
  }, []);

  // Load top traders today by trade count
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingTop(true);
        const top = await getTopTradersByTradeCountToday(3);
        if (!cancelled) setTopTraders(top);
      } catch {
        if (!cancelled) setTopTraders([]);
      } finally {
        if (!cancelled) setLoadingTop(false);
      }
    })();
    return () => { cancelled = true; };
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

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetchAllMids('');
        if (cancelled) return;
        const map: Record<string, number> = {};
        Object.entries(res || {}).forEach(([k, v]) => {
          const num = parseFloat(v as string);
          if (!Number.isNaN(num)) {
            map[k] = num;
            if (k.startsWith('@')) map[k.slice(1)] = num;
          }
        });
        setMids(map);
      } catch (_) {
        // ignore network errors
      }
    };
    // initial load
    load();
    // poll every 10 seconds
    const id = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <div className="w-80 p-4 space-y-4 sticky top-0 h-screen overflow-y-auto">
      {/* Top Traders Today (most trades) */}
      <Card className="overflow-hidden">
        <div className="p-4 pb-0">
          <h3 className="text-lg">Top Traders Today</h3>
        </div>
        <div className="divide-y divide-border">
          {loadingTop ? (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          ) : (topTraders && topTraders.length > 0 ? (
            topTraders.map(({ user, tradesToday }) => (
              <div 
                key={user.id} 
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onUserClick && onUserClick(user.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <img src={user.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&s=64'} alt={user.name || user.username} className="w-full h-full object-cover rounded-full" />
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm truncate">{user.name || user.username}</div>
                      <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{tradesToday} trades</div>
                    <div className="text-xs text-muted-foreground">today</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-sm text-muted-foreground">No trades yet today.</div>
          ))}
        </div>
        {/* <div className="p-4 pt-0">
          <button className="text-primary text-xs hover:underline">
            Show more
          </button>
        </div> */}
      </Card>

      {/* Top Volume Markets */}
      <Card className="overflow-hidden">
        <div className="p-4 pb-0">
          <h3 className="text-lg">Trending</h3>
        </div>
        <div className="divide-y divide-border">
          {trending.map((asset) => {
            const perp = mapToPerp(asset.symbol);
            const live = mids?.[perp] ?? mids?.[perp.replace('-PERP','')] ?? undefined;
            const displayPrice = live ?? asset.price;
            return (
              <div key={asset.symbol} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${displayPrice.toLocaleString()}</div>
                  <div className={
                    asset.change > 0 
                      ? 'text-green-600 dark:text-green-400 text-sm' 
                      : 'text-red-600 dark:text-red-400 text-sm'
                  }>
                    {asset.change > 0 ? '+' : ''}{asset.change}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* <div className="p-4 pt-0">
          <button className="text-primary text-xs hover:underline">
            Show more
          </button>
        </div> */}
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
        {/* <div className="p-4 pt-0">
          <button className="text-primary text-xs hover:underline">
            Show more
          </button>
        </div> */}
      </Card>


    </div>
  );
}