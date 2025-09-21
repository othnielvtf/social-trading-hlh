import React from 'react';
import { Avatar } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Heart } from 'lucide-react';
import type { TradingPost } from './types';

interface PostCardProps {
  post: TradingPost;
  setIsTradeModalOpen: (open: boolean) => void;
  onUserClick?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, setIsTradeModalOpen, onUserClick }) => {
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
                const activity = post.tradeActivity || { type: 'buy', amount: '2K', asset: 'BTC' } as const; // fallback data
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
                  const colors: Record<string, string> = {
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
};
