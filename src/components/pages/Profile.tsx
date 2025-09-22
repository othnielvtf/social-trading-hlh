import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Link as LinkIcon, Edit, Settings, TrendingUp, Users, Activity, Heart, Wallet, Mail } from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ProfileEditModal } from '../ProfileEditModal';
import { useFirestoreAuthContext } from '../../contexts/FirestoreAuthContext';
import { getUserPosts, Post, getUser, type UserData } from '../../utils/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  followers: number;
  following: number;
  totalPnL: number;
  totalPnLPercent: number;
  winRate: number;
  totalTrades: number;
  isFollowing: boolean;
}

interface UserPost {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
  trade?: {
    symbol: string;
    type: 'long' | 'short';
    pnl: number;
    pnlPercent: number;
  };
}

// Current user profile (yourself)
const currentUserProfile: UserProfile = {
  name: 'Alex Chen',
  username: 'alexchen_trades',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
  bio: 'Full-time crypto trader • Risk management enthusiast • Building wealth through DeFi 📈',
  location: 'San Francisco, CA',
  website: 'alexchentrading.com',
  joinDate: 'March 2023',
  followers: 1245,
  following: 389,
  totalPnL: 45670,
  totalPnLPercent: 187.3,
  winRate: 68.4,
  totalTrades: 234,
  isFollowing: false
};

// Removed mock profiles for other users; we load from Firestore instead

const mockPosts: UserPost[] = [
  {
    id: '1',
    content: 'Just closed my ETH long position. Market looking a bit uncertain here, taking some profits and waiting for a clearer signal.',
    timestamp: '2h',
    likes: 24,
    comments: 8,
    reposts: 3,
    trade: {
      symbol: 'ETH-USD',
      type: 'long',
      pnl: 1250,
      pnlPercent: 5.2
    }
  },
  {
    id: '2',
    content: 'Market analysis: BTC consolidating around $43k. Watching for a breakout above resistance or breakdown below $42k support.',
    timestamp: '6h',
    likes: 67,
    comments: 15,
    reposts: 12
  },
  {
    id: '3',
    content: 'Risk management tip: Never risk more than 2% of your portfolio on a single trade. This has saved me countless times.',
    timestamp: '1d',
    likes: 156,
    comments: 32,
    reposts: 89
  }
];

const mockStats = [
  { label: 'Best Day', value: '$2,340', change: '+15.7%' },
  { label: 'Worst Day', value: '-$890', change: '-4.2%' },
  { label: 'Avg Trade Size', value: '$1,250', change: '' },
  { label: 'Profit Factor', value: '2.1x', change: '' },
];

const mockOpenPositions = [
  { id: '1', symbol: 'PUMP', name: 'Pump', amount: '26,458,218.81', value: '194,900.20', pnlPercent: 77.38 },
  { id: '2', symbol: 'CODEC', name: 'Codec Flow', amount: '27,303.86', value: '849.89', pnlPercent: 28.36 },
  { id: '3', symbol: 'POLYFACTS', name: 'Polyfactual', amount: '118,106.55', value: '709.60', pnlPercent: 1.83 },
  { id: '4', symbol: 'HBC', name: 'Homebrew Robotics Club', amount: '34,125.42', value: '643.11', pnlPercent: -12.45 },
];

const mockClosedPositions = [
  { id: '1', symbol: 'ARBETS', name: 'ArbBets', date: 'Sep 13 at 12:58 AM', pnl: 8305.21, pnlPercent: 1284.05 },
  { id: '2', symbol: 'ZARD', name: 'ZARD', date: 'Sep 6 at 7:29 AM', pnl: 3519.42, pnlPercent: 340.85 },
  { id: '3', symbol: 'BASEDD', name: 'BASEDD', date: 'Jun 18 at 9:36 AM', pnl: 1292.39, pnlPercent: 70.12 },
  { id: '4', symbol: 'CHARLIE', name: 'CHARLIE', date: 'Sep 11 at 4:32 AM', pnl: 840.71, pnlPercent: 56.60 },
  { id: '5', symbol: 'YOURSELF', name: 'YOURSELF', date: 'Sep 6 at 4:27 AM', pnl: 486.49, pnlPercent: 29.71 },
  { id: '6', symbol: 'kook', name: 'kook', date: 'Sep 15 at 6:22 AM', pnl: 246.54, pnlPercent: 17.25 },
  { id: '7', symbol: 'Hosico', name: 'Hosico', date: 'May 21 at 2:37 AM', pnl: 167.18, pnlPercent: 33.59 },
  { id: '8', symbol: 'Fartcoin', name: 'Fartcoin', date: 'May 6 at 10:41 PM', pnl: 20.69, pnlPercent: 60.42 },
];

interface ProfileProps {
  userId?: string | null;
  onUserClick?: (userId: string) => void;
}

export function Profile({ userId, onUserClick }: ProfileProps) {
  const [activeTab, setActiveTab] = useState('posts');
  const [copiedField, setCopiedField] = useState<'address' | 'email' | null>(null);
  const { user: firestoreUser, privyUser } = useFirestoreAuthContext();
  const [userPosts, setUserPosts] = useState<Post[] | null>(null);
  const [targetUser, setTargetUser] = useState<UserData | null>(null);
  const [tradesCount, setTradesCount] = useState<number>(0);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  
  // Get the profile data - use current user if no userId provided
  const isOwnProfile = !userId;
  const defaultOwn = currentUserProfile;
  const mappedOwn = firestoreUser && isOwnProfile ? {
    name: firestoreUser.name ?? defaultOwn.name,
    username: firestoreUser.username ?? defaultOwn.username,
    avatar: firestoreUser.avatar ?? defaultOwn.avatar,
    bio: firestoreUser.bio ?? defaultOwn.bio,
    location: firestoreUser.location ?? defaultOwn.location,
    website: firestoreUser.website ?? defaultOwn.website,
    joinDate: defaultOwn.joinDate,
    followers: firestoreUser.followers ?? defaultOwn.followers,
    following: firestoreUser.following ?? defaultOwn.following,
    totalPnL: firestoreUser.totalPnL ?? defaultOwn.totalPnL,
    totalPnLPercent: firestoreUser.totalPnLPercent ?? defaultOwn.totalPnLPercent,
    winRate: firestoreUser.winRate ?? defaultOwn.winRate,
    totalTrades: firestoreUser.totalTrades ?? defaultOwn.totalTrades,
    isFollowing: false,
  } as UserProfile : defaultOwn;

  const profile: UserProfile = isOwnProfile
    ? mappedOwn
    : (
      targetUser ? {
        name: targetUser.name || 'User',
        username: targetUser.username || `user_${targetUser.id.slice(0, 6)}`,
        avatar: targetUser.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&s=256',
        bio: targetUser.bio || '',
        location: targetUser.location || '',
        website: targetUser.website || '',
        joinDate: '—',
        followers: targetUser.followers ?? 0,
        following: targetUser.following ?? 0,
        totalPnL: targetUser.totalPnL ?? 0,
        totalPnLPercent: targetUser.totalPnLPercent ?? 0,
        winRate: targetUser.winRate ?? 0,
        totalTrades: targetUser.totalTrades ?? 0,
        isFollowing: false,
      } : currentUserProfile
    );

  const [isEditOpen, setIsEditOpen] = useState(false);

  // Load Firestore posts for the target user and compute Trades count
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const initialId = isOwnProfile ? firestoreUser?.id : userId;
      if (!initialId) return;
      try {
        setLoadingProfile(true);
        // Load target user doc if viewing someone else
        if (!isOwnProfile && userId) {
          const u = await getUser(userId);
          if (!cancelled) setTargetUser(u);
        } else {
          setTargetUser(null);
        }
        // First try treating the param as a Firestore userId
        let posts = await getUserPosts(initialId);
        if (!cancelled && posts.length === 0 && !isOwnProfile) {
          // Fallback: treat provided value as username, resolve to userId
          const usersRef = collection(db, 'users');
          const qUsers = query(usersRef, where('username', '==', initialId));
          const qs = await getDocs(qUsers);
          const docSnap = qs.docs[0];
          if (docSnap) {
            const resolvedId = docSnap.id;
            const u = await getUser(resolvedId);
            if (!cancelled) setTargetUser(u);
            posts = await getUserPosts(resolvedId);
          }
        }
        if (cancelled) return;
        setUserPosts(posts);
        const trades = posts.filter(p => (p as any).trade != null).length;
        setTradesCount(trades);
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOwnProfile, firestoreUser?.id, userId]);

  return (
    <div className="h-screen flex flex-col">

      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="relative">
            {/* Cover Photo */}

            
            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              <div className="p-4 space-y-3">
                {/* Username */}
                {loadingProfile ? (
                  <div className="h-4 w-40 bg-accent/50 rounded animate-pulse" />
                ) : (
                  <div className="text-lg text-muted-foreground">@{profile.username}</div>
                )}
                {/* Identity: wallet or email from Privy (full, with copy) - only for own profile */}
                {isOwnProfile && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {privyUser?.address ? (
                      <div className="inline-flex items-center gap-2">
                        <Wallet className="w-3 h-3" />
                        <span className="font-mono text-foreground/80 break-all">{privyUser.address}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(privyUser.address || '');
                            setCopiedField('address');
                            setTimeout(() => setCopiedField(null), 1200);
                          }}
                          className="px-2 py-0.5 rounded border border-border text-foreground hover:bg-accent/50"
                        >
                          {copiedField === 'address' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    ) : privyUser?.email ? (
                      <div className="inline-flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        <span className="text-foreground/80 break-all">{privyUser.email}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(privyUser.email || '');
                            setCopiedField('email');
                            setTimeout(() => setCopiedField(null), 1200);
                          }}
                          className="px-2 py-0.5 rounded border border-border text-foreground hover:bg-accent/50"
                        >
                          {copiedField === 'email' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
                
                {/* Profile Picture, Name and Stats */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      {loadingProfile ? (
                        <div className="w-20 h-20 rounded-full bg-accent/50 animate-pulse" />
                      ) : (
                        <Avatar className="w-20 h-20">
                          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover rounded-full" />
                        </Avatar>
                      )}
                      {isOwnProfile && !loadingProfile && (
                        <button
                          onClick={() => setIsEditOpen(true)}
                          className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background hover:bg-primary/90"
                          aria-label="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      {loadingProfile ? (
                        <div className="h-5 w-48 bg-accent/50 rounded animate-pulse" />
                      ) : (
                        <div className="text-lg">{profile.name}</div>
                      )}
                      <div className="flex gap-12">
                        <div className="text-center">
                          <div className="text-lg">{loadingProfile ? <div className="h-5 w-10 bg-accent/50 rounded animate-pulse mx-auto" /> : tradesCount}</div>
                          <div className="text-muted-foreground text-xs">Trades</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg">{loadingProfile ? <div className="h-5 w-10 bg-accent/50 rounded animate-pulse mx-auto" /> : profile.followers}</div>
                          <div className="text-muted-foreground text-xs">Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg">{loadingProfile ? <div className="h-5 w-10 bg-accent/50 rounded animate-pulse mx-auto" /> : profile.following}</div>
                          <div className="text-muted-foreground text-xs">Following</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Follow/Edit Button */}
                  {!isOwnProfile ? (
                    loadingProfile ? (
                      <div className="h-9 w-24 bg-accent/50 rounded animate-pulse" />
                    ) : (
                      <Button 
                        variant={profile.isFollowing ? "outline" : "default"}
                        className="px-6"
                      >
                        {profile.isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )
                  ) : (
                    <Button variant="outline" className="px-6" onClick={() => setIsEditOpen(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
                
                {/* Bio Section */}
                <div className="text-sm text-muted-foreground">
                  {loadingProfile ? (
                    <div className="h-10 w-full bg-accent/50 rounded animate-pulse" />
                  ) : (
                    profile.bio || (isOwnProfile ? "Add a bio ..." : "No bio available")
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Trading Stats */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${profile.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profile.totalPnL >= 0 ? '+' : ''}${profile.totalPnL.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total P&L</div>
                  <div className={`text-xs ${profile.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profile.totalPnL >= 0 ? '+' : ''}{profile.totalPnLPercent}%
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{profile.winRate}%</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">$1.2M</div>
                  <div className="text-sm text-muted-foreground">Total Volume</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">2.1x</div>
                  <div className="text-sm text-muted-foreground">Profit Factor</div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Tabs */}
          <div className="px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="posts">Posts</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-4">
                {!userPosts ? (
                  <div className="text-sm text-muted-foreground">Loading posts…</div>
                ) : userPosts.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No posts yet.</div>
                ) : (
                  userPosts.map((post) => (
                    <ProfilePost key={post.id} post={post} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {isOwnProfile && (
        <ProfileEditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      )}
    </div>
  );
}

import type { Post as FirestorePost } from '../../utils/firestore';

const ProfilePost: React.FC<{ post: FirestorePost }> = ({ post }) => {
  const ts = (post as any)?.timestamp;
  const date: Date | null = ts && typeof ts === 'object' && typeof ts.toDate === 'function' ? ts.toDate() : null;
  const timeLabel = date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date) : '';
  const trade = (post as any)?.trade as { symbol?: string; type?: 'long'|'short'; pnl?: number; pnlPercent?: number } | undefined;
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {timeLabel ? <span>{timeLabel}</span> : null}
        </div>
        
        <p>{post.content}</p>
        
        {trade && (
          <Card className="p-3 bg-accent/30">
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
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {(trade.type || '').toUpperCase()}
                </Badge>
                <span className="font-medium">{trade.symbol}</span>
              </div>
              {(typeof trade.pnl === 'number' || typeof trade.pnlPercent === 'number') && (
                <div className="text-green-600 font-medium">
                  {typeof trade.pnl === 'number' ? `${trade.pnl >= 0 ? '+' : ''}$${Math.abs(trade.pnl).toFixed(0)}` : ''}
                  {typeof trade.pnlPercent === 'number' ? ` (${trade.pnlPercent.toFixed(1)}%)` : ''}
                </div>
              )}
            </div>
          </Card>
        )}
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <button className="hover:text-foreground flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {post.likes ?? 0}
          </button>
        </div>
      </div>
    </Card>
  );
}