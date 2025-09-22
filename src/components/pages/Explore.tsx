import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, UserPlus, Users } from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useFirestoreAuthContext } from '../../contexts/FirestoreAuthContext';
import { getTopTradersByTradeCountToday, type TraderTradeCount, getFollowingIds, getUser, type UserData, getAllUsers, getUserPosts, type Post, followUser, unfollowUser } from '../../utils/firestore';
import { fetchAllMids } from '../../utils/hyperliquid';

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

type ExploreProps = { onUserClick?: (userId: string) => void };

export function Explore({ onUserClick }: ExploreProps) {
  const [activeTab, setActiveTab] = useState('top-traders');
  const { user: currentUser } = useFirestoreAuthContext();
  const [topByTrades, setTopByTrades] = useState<TraderTradeCount[] | null>(null);
  const [allUsers, setAllUsers] = useState<UserData[] | null>(null);
  const [friends, setFriends] = useState<UserData[] | null>(null);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [search, setSearch] = useState('');
  const [mids, setMids] = useState<Record<string, number> | null>(null);
  const [winRates, setWinRates] = useState<Record<string, number>>({});
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingTop(true);
        // Load all users and sort by totalTrades desc
        const users = await getAllUsers(500);
        const sorted = [...users].sort((a, b) => (b.totalTrades ?? 0) - (a.totalTrades ?? 0));
        if (!cancelled) setAllUsers(sorted);
      } finally {
        if (!cancelled) setLoadingTop(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingFriends(true);
        if (!currentUser?.id) { if (!cancelled) setFriends([]); return; }
        const ids = await getFollowingIds(currentUser.id);
        const users = await Promise.all(ids.map(id => getUser(id)));
        const list = users.filter(Boolean) as UserData[];
        if (!cancelled) {
          setFriends(list);
          setFollowingSet(new Set(ids));
        }
      } finally {
        if (!cancelled) setLoadingFriends(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  // Load mids for live calculations
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const midsRes = await fetchAllMids('');
        if (cancelled) return;
        const parsed: Record<string, number> = {};
        Object.entries(midsRes || {}).forEach(([k, v]) => {
          const num = parseFloat(v as string);
          if (!Number.isNaN(num)) {
            parsed[k] = num;
            if (k.startsWith('@')) parsed[k.slice(1)] = num;
          }
        });
        setMids(parsed);
      } catch {
        setMids(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Compute dynamic win rates based on posts (entry vs mid or pnlPercent)
  useEffect(() => {
    let cancelled = false;
    const ids = new Set<string>();
    (allUsers || []).forEach(u => ids.add(u.id));
    (friends || []).forEach(u => ids.add(u.id));
    if (ids.size === 0) return;

    (async () => {
      const entries = Array.from(ids);
      const batches = await Promise.all(entries.map(async (id) => {
        try {
          const posts = await getUserPosts(id);
          let wins = 0;
          let total = 0;
          for (const p of posts) {
            const t = (p as any).trade as { entry?: number; type?: 'long'|'short'; pnlPercent?: number; symbol?: string } | undefined;
            if (!t) continue;
            total++;
            let isWin: boolean | null = null;
            if (typeof t.entry === 'number' && t.symbol && mids) {
              const base = t.symbol.split('-')[0]?.toUpperCase();
              const mid = base ? (mids[base] ?? null) : null;
              if (mid) {
                const diff = t.type === 'short' ? (t.entry - mid) : (mid - t.entry);
                isWin = diff > 0;
              }
            }
            if (isWin === null && typeof t.pnlPercent === 'number') {
              isWin = t.pnlPercent > 0;
            }
            if (isWin) wins++;
          }
          const rate = total > 0 ? (wins / total) * 100 : 0;
          return { id, rate };
        } catch {
          return { id, rate: 0 };
        }
      }));
      if (cancelled) return;
      const map: Record<string, number> = {};
      for (const b of batches) map[b.id] = b.rate;
      setWinRates(map);
    })();

    return () => { cancelled = true; };
  }, [allUsers, friends, mids]);

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

          {/* Search bar */}
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search traders by name or @username"
              className="w-full px-3 py-2 border border-border rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          
          <div className="flex items-center justify-between mb-6">

            
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
                {loadingTop ? (
                  <Card className="p-4"><div className="h-6 w-40 bg-accent/50 rounded animate-pulse" /></Card>
                ) : !allUsers || allUsers.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No traders yet.</div>
                ) : (
                  allUsers
                    .filter((user) => {
                      const q = search.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        (user.name || '').toLowerCase().includes(q) ||
                        (user.username || '').toLowerCase().includes(q)
                      );
                    })
                    .map((user, index) => (
                      <div key={user.id}>
                        <TraderCard 
                          onClick={() => onUserClick && onUserClick(user.id)}
                          trader={{
                            id: user.id,
                            name: user.name || user.username,
                            username: user.username,
                            avatar: user.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&s=64',
                            isFollowing: followingSet.has(user.id),
                            winRate: typeof winRates[user.id] === 'number' ? Number(winRates[user.id].toFixed(1)) : (user.winRate ?? 0),
                            totalPnL: user.totalPnL ?? 0,
                            totalPnLPercent: user.totalPnLPercent ?? 0,
                            followers: user.followers ?? 0,
                            trades: user.totalTrades ?? 0,
                            recentTrades: []
                          }}
                          rank={index + 1}
                          onFollowToggle={async (targetId, nextFollow) => {
                            if (!currentUser?.id || followLoading[targetId]) return;
                            setFollowLoading(prev => ({ ...prev, [targetId]: true }));
                            const ok = nextFollow 
                              ? await followUser(currentUser.id, targetId)
                              : await unfollowUser(currentUser.id, targetId);
                            setFollowLoading(prev => ({ ...prev, [targetId]: false }));
                            if (ok) {
                              setFollowingSet(prev => {
                                const s = new Set(prev);
                                if (nextFollow) s.add(targetId); else s.delete(targetId);
                                return s;
                              });
                            }
                          }}
                          isFollowBusy={!!followLoading[user.id]}
                        />
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="friends">
              <div className="space-y-4">
                {loadingFriends ? (
                  <Card className="p-4"><div className="h-6 w-40 bg-accent/50 rounded animate-pulse" /></Card>
                ) : !friends || friends.length === 0 ? (
                  <div className="text-sm text-muted-foreground">You are not following anyone yet.</div>
                ) : (
                  friends
                    .filter((u) => {
                      const q = search.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        (u.name || '').toLowerCase().includes(q) ||
                        (u.username || '').toLowerCase().includes(q)
                      );
                    })
                    .map((u, index) => (
                      <div key={u.id}>
                        <TraderCard 
                          onClick={() => onUserClick && onUserClick(u.id)}
                          trader={{
                            id: u.id,
                            name: u.name || u.username,
                            username: u.username,
                            avatar: u.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&s=64',
                            isFollowing: true,
                            winRate: typeof winRates[u.id] === 'number' ? Number(winRates[u.id].toFixed(1)) : (u.winRate ?? 0),
                            totalPnL: u.totalPnL ?? 0,
                            totalPnLPercent: u.totalPnLPercent ?? 0,
                            followers: u.followers ?? 0,
                            trades: u.totalTrades ?? 0,
                            recentTrades: []
                          }}
                          rank={index + 1}
                          showRank={false}
                          onFollowToggle={async (targetId, nextFollow) => {
                            if (!currentUser?.id || followLoading[targetId]) return;
                            setFollowLoading(prev => ({ ...prev, [targetId]: true }));
                            const ok = nextFollow 
                              ? await followUser(currentUser.id, targetId)
                              : await unfollowUser(currentUser.id, targetId);
                            setFollowLoading(prev => ({ ...prev, [targetId]: false }));
                            if (ok) {
                              setFollowingSet(prev => {
                                const s = new Set(prev);
                                if (nextFollow) s.add(targetId); else s.delete(targetId);
                                return s;
                              });
                              // also update friends list if unfollowed
                              if (!nextFollow) {
                                setFriends(prev => (prev ? prev.filter(f => f.id !== targetId) : prev));
                              }
                            }
                          }}
                          isFollowBusy={!!followLoading[u.id]}
                        />
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function TraderCard({ trader, rank, showRank = true, onClick, onFollowToggle, isFollowBusy }: { trader: Trader; rank: number; showRank?: boolean; onClick?: () => void; onFollowToggle?: (targetId: string, nextFollow: boolean) => void; isFollowBusy?: boolean }) {
  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={onClick}>
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
          disabled={isFollowBusy}
          onClick={(e) => {
            e.stopPropagation();
            if (onFollowToggle) onFollowToggle(trader.id, !trader.isFollowing);
          }}
        >
          {isFollowBusy ? '…' : (trader.isFollowing ? "Following" : "Follow")}
        </Button>
      </div>
    </Card>
  );
}