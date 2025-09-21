import type { TradingPost } from './types';

export const mockPosts: TradingPost[] = [
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
