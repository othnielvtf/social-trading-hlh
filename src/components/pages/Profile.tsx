import React, { useState } from 'react';
import { Calendar, MapPin, Link as LinkIcon, Edit, Settings, TrendingUp, Users, Activity, Heart } from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ProfileEditModal } from '../ProfileEditModal';
import { useFirestoreAuthContext } from '../../contexts/FirestoreAuthContext';

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

// Mock profiles for other users
const mockUserProfiles: { [key: string]: UserProfile } = {
  'crypto_sarah': {
    name: 'Sarah Kim',
    username: 'crypto_sarah',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=120&h=120&fit=crop&crop=face',
    bio: 'ETH maximalist • Technical analyst • Teaching crypto strategies 📈',
    location: 'Los Angeles, CA',
    website: 'sarahkim.crypto',
    joinDate: 'February 2023',
    followers: 2890,
    following: 456,
    totalPnL: 67450,
    totalPnLPercent: 203.8,
    winRate: 76.4,
    totalTrades: 198,
    isFollowing: false
  },
  'sarah_defi': {
    name: 'Sarah Martinez',
    username: 'sarah_defi',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2122e94?w=120&h=120&fit=crop&crop=face',
    bio: 'DeFi yield farmer • Smart contract security researcher • Building the future of finance 🚀',
    location: 'Austin, TX',
    website: 'sarahdefi.com',
    joinDate: 'January 2023',
    followers: 892,
    following: 234,
    totalPnL: 23890,
    totalPnLPercent: 95.6,
    winRate: 74.2,
    totalTrades: 156,
    isFollowing: true
  },
  'crypto_mike': {
    name: 'Mike Johnson',
    username: 'crypto_mike',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
    bio: 'Bitcoin maximalist • Day trader • Teaching crypto fundamentals 💎🙌',
    location: 'Miami, FL',
    website: 'cryptomike.co',
    joinDate: 'June 2022',
    followers: 2156,
    following: 445,
    totalPnL: 78920,
    totalPnLPercent: 234.8,
    winRate: 65.3,
    totalTrades: 389,
    isFollowing: false
  },
  'lisa_trades': {
    name: 'Lisa Wang',
    username: 'lisa_trades',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face',
    bio: 'Algorithmic trader • Options strategist • Risk management expert 📊',
    location: 'New York, NY',
    website: 'lisawang.trading',
    joinDate: 'September 2022',
    followers: 1567,
    following: 321,
    totalPnL: 56780,
    totalPnLPercent: 167.4,
    winRate: 71.8,
    totalTrades: 298,
    isFollowing: true
  }
};

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
  const [activeTab, setActiveTab] = useState('open');
  const { user: firestoreUser } = useFirestoreAuthContext();
  
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

  const profile = isOwnProfile
    ? mappedOwn
    : (userId ? mockUserProfiles[userId] || currentUserProfile : mappedOwn);

  const [isEditOpen, setIsEditOpen] = useState(false);

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
                <div className="text-lg text-muted-foreground">@{profile.username}</div>
                
                {/* Profile Picture, Name and Stats */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover rounded-full" />
                      </Avatar>
                      {isOwnProfile && (
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
                      <div className="text-lg">{profile.name}</div>
                      <div className="flex gap-12">
                        <div className="text-center">
                          <div className="text-lg">{profile.totalTrades}</div>
                          <div className="text-muted-foreground text-xs">Trades</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg">{profile.followers}</div>
                          <div className="text-muted-foreground text-xs">Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg">{profile.following}</div>
                          <div className="text-muted-foreground text-xs">Following</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Follow/Edit Button */}
                  {!isOwnProfile ? (
                    <Button 
                      variant={profile.isFollowing ? "outline" : "default"}
                      className="px-6"
                    >
                      {profile.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  ) : (
                    <Button variant="outline" className="px-6" onClick={() => setIsEditOpen(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
                
                {/* Bio Section */}
                <div className="text-sm text-muted-foreground">
                  {profile.bio || (isOwnProfile ? "Add a bio ..." : "No bio available")}
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
                <TabsTrigger value="open">Open positions</TabsTrigger>
                <TabsTrigger value="closed">Closed positions</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
              </TabsList>

              <TabsContent value="open" className="space-y-3">
                {mockOpenPositions.map((position, index) => (
                  <Card key={position.id} className="p-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {position.symbol.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{position.name}</span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs px-2 py-0.5 ${
                                index % 2 === 0
                                  ? 'bg-green-100 text-green-700 border-green-200' 
                                  : 'bg-red-100 text-red-700 border-red-200'
                              }`}
                            >
                              {index % 2 === 0 ? 'LONG' : 'SHORT'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">Opened 12 Sep at 09:15</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${position.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {position.pnlPercent >= 0 ? '+' : ''}${Math.abs(position.pnlPercent * 10).toFixed(0)}
                        </div>
                        <div className={`text-xs flex items-center justify-end gap-1 ${position.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {position.pnlPercent >= 0 ? '▲' : '▼'} {Math.abs(position.pnlPercent)}%
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="closed" className="space-y-3">
                {mockClosedPositions.map((position, index) => (
                  <Card key={position.id} className="p-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {position.symbol.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{position.name}</span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs px-2 py-0.5 ${
                                index % 3 === 0
                                  ? 'bg-green-100 text-green-700 border-green-200' 
                                  : 'bg-red-100 text-red-700 border-red-200'
                              }`}
                            >
                              {index % 3 === 0 ? 'LONG' : 'SHORT'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">Closed {position.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {position.pnl >= 0 ? '+' : ''}${position.pnl}
                        </div>
                        <div className={`text-xs flex items-center justify-end gap-1 ${position.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {position.pnlPercent >= 0 ? '▲' : '▼'} {Math.abs(position.pnlPercent)}%
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="posts" className="space-y-4">
                {mockPosts.map((post) => (
                  <ProfilePost key={post.id} post={post} />
                ))}
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

const ProfilePost: React.FC<{ post: UserPost }> = ({ post }) => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{post.timestamp}</span>
        </div>
        
        <p>{post.content}</p>
        
        {post.trade && (
          <Card className="p-3 bg-accent/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline"
                  className={`text-xs ${
                    post.trade.type === 'long' 
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' 
                      : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {post.trade.type.toUpperCase()}
                </Badge>
                <span className="font-medium">{post.trade.symbol}</span>
              </div>
              <div className="text-green-600 font-medium">
                +${post.trade.pnl.toFixed(0)} ({post.trade.pnlPercent.toFixed(1)}%)
              </div>
            </div>
          </Card>
        )}
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <button className="hover:text-foreground flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {post.likes}
          </button>
        </div>
      </div>
    </Card>
  );
}