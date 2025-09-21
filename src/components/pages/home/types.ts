export type FeedTab = 'for-you' | 'friends' | 'on-chain';

export interface TradingPost {
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
