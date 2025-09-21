import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useFirestoreAuthContext } from '../../contexts/FirestoreAuthContext';
import { fetchAllMids, fetchClearinghouseState, fetchSpotClearinghouseState, SpotBalance } from '../../utils/hyperliquid';

interface Position {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
}

interface ClosedTrade {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  size: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPercent: number;
  openTime: string;
  closeTime: string;
}

const mockPositions: Position[] = [
  {
    id: '1',
    symbol: 'BTC-USD',
    type: 'long',
    size: 0.5,
    entryPrice: 42800,
    currentPrice: 43200,
    pnl: 200,
    pnlPercent: 0.93,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    symbol: 'ETH-USD',
    type: 'long',
    size: 2.5,
    entryPrice: 2350,
    currentPrice: 2387,
    pnl: 92.5,
    pnlPercent: 1.57,
    timestamp: '5 hours ago'
  },
  {
    id: '3',
    symbol: 'SOL-USD',
    type: 'short',
    size: 10,
    entryPrice: 115,
    currentPrice: 112,
    pnl: 30,
    pnlPercent: 2.61,
    timestamp: '1 day ago'
  }
];

const mockClosedTrades: ClosedTrade[] = [
  {
    id: '1',
    symbol: 'AVAX-USD',
    type: 'long',
    size: 25,
    entryPrice: 35.20,
    exitPrice: 37.80,
    pnl: 65,
    pnlPercent: 7.39,
    openTime: '2 days ago',
    closeTime: '1 day ago'
  },
  {
    id: '2',
    symbol: 'MATIC-USD',
    type: 'short',
    size: 1000,
    entryPrice: 0.92,
    exitPrice: 0.88,
    pnl: 40,
    pnlPercent: 4.35,
    openTime: '3 days ago',
    closeTime: '2 days ago'
  },
  {
    id: '3',
    symbol: 'UNI-USD',
    type: 'long',
    size: 50,
    entryPrice: 6.80,
    exitPrice: 6.55,
    pnl: -12.5,
    pnlPercent: -3.68,
    openTime: '4 days ago',
    closeTime: '3 days ago'
  }
];

export function Portfolio() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('positions');
  const { privyUser } = useFirestoreAuthContext();

  const address = privyUser?.address;
  const [balances, setBalances] = useState<SpotBalance[] | null>(null);
  const [margin, setMargin] = useState<{
    accountValue: string;
    totalNtlPos: string;
    totalRawUsd: string;
    totalMarginUsed: string;
    withdrawable: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mids, setMids] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address) return;
      setLoading(true);
      setError(null);
      try {
        const [spotRes, chRes, midsRes] = await Promise.all([
          fetchSpotClearinghouseState(address, ''),
          fetchClearinghouseState(address, ''),
          fetchAllMids(''),
        ]);
        if (cancelled) return;
        setBalances(spotRes.balances || []);
        setMargin({
          accountValue: chRes.marginSummary.accountValue,
          totalNtlPos: chRes.marginSummary.totalNtlPos,
          totalRawUsd: chRes.marginSummary.totalRawUsd,
          totalMarginUsed: chRes.marginSummary.totalMarginUsed,
          withdrawable: chRes.withdrawable,
        });
        // Keep both symbol and id variants in the map so we can look up by coin (e.g., 'HYPE')
        // and by token id (e.g., '@1' or '1').
        const midsParsed: Record<string, number> = {};
        Object.entries(midsRes || {}).forEach(([k, v]) => {
          const num = parseFloat(v as string);
          if (Number.isNaN(num)) return;
          // Preserve original key (could be 'HYPE' or '@1')
          midsParsed[k] = num;
          // If key starts with '@', also add the numeric-only variant
          if (k.startsWith('@')) {
            midsParsed[k.slice(1)] = num;
          }
        });
        setMids(midsParsed);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load portfolio data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [address]);

  const totalBalance = useMemo(() => {
    if (!balances || !mids) return 0;
    return balances.reduce((sum, b) => {
      const qty = parseFloat(b.total) || 0;
      const mid = b.coin === 'USDC' ? 1 : (mids[b.coin] ?? mids[`@${b.token}`] ?? mids[String(b.token)] ?? 0);
      return sum + qty * mid;
    }, 0);
  }, [balances, mids]);
  const totalPnL = 0; // Not provided by API; keep placeholder for now
  const totalPnLPercent = 0; // Placeholder
  const availableMargin = useMemo(() => {
    return margin ? parseFloat(margin.withdrawable) || 0 : 0;
  }, [margin]);

  return (
    <div className="h-screen flex flex-col">

      
      <div className="flex-1 overflow-y-auto p-4 bg-green-50/20 dark:bg-green-950/10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  Total Balance
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                  >
                    {isBalanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isBalanceVisible ? `$${totalBalance.toLocaleString()}` : '••••••'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total PnL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalPnL > 0 ? 'text-green-600' : totalPnL < 0 ? 'text-red-600' : ''}`}>
                  {isBalanceVisible ? (
                    <>
                      {totalPnL > 0 ? '+' : ''}${totalPnL.toFixed(2)}
                      <div className="text-sm">
                        ({totalPnL > 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
                      </div>
                    </>
                  ) : (
                    '••••••'
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Available Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isBalanceVisible ? `$${availableMargin.toLocaleString()}` : '••••••'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isBalanceVisible ? '$2.4M' : '••••••'}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Hyperliquid: Balances + Margin */}
          <div className="space-y-4">
            {!address ? (
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground">
                  Connect a wallet to view your on-chain portfolio summary.
                </CardContent>
              </Card>
            ) : loading ? (
              <Card>
                <CardContent className="p-4">Loading Hyperliquid data…</CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="p-4 text-destructive">{error}</CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Spot Balances</CardTitle></CardHeader>
                  <CardContent className="p-4 space-y-2">
                    {balances && balances.length > 0 ? (
                      balances.map((b, idx) => (
                        <div key={`${b.coin}-${idx}`} className="flex items-center justify-between text-sm">
                          <div className="text-muted-foreground">{b.coin}</div>
                          <div className="font-medium flex items-center gap-2">
                            <span>{parseFloat(b.total).toLocaleString()}</span>
                            <span className="text-muted-foreground">@ ${
                              b.coin === 'USDC'
                                ? '1'
                                : (mids ? (mids[b.coin] ?? mids[`@${b.token}`] ?? mids[String(b.token)] ?? 0).toLocaleString() : '-')
                            }</span>
                            <span>
                              = ${(
                                (parseFloat(b.total)||0) * (
                                  b.coin === 'USDC' ? 1 : (mids ? (mids[b.coin] ?? mids[`@${b.token}`] ?? mids[String(b.token)] ?? 0) : 0)
                                )
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No balances</div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Margin Summary</CardTitle></CardHeader>
                  <CardContent className="p-4 space-y-2 text-sm">
                    {margin ? (
                      <>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Account Value</span><span className="font-medium">{margin.accountValue}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Total Notional</span><span className="font-medium">{margin.totalNtlPos}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Raw USD</span><span className="font-medium">{margin.totalRawUsd}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Margin Used</span><span className="font-medium">{margin.totalMarginUsed}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Withdrawable</span><span className="font-medium">{margin.withdrawable}</span></div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">No margin data</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Positions and History */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="positions">Open positions</TabsTrigger>
                <TabsTrigger value="orders">Open orders</TabsTrigger>
                <TabsTrigger value="closed">Closed positions</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled className="opacity-50 cursor-not-allowed text-muted-foreground">
                  24h
                </Button>
                <Button variant="ghost" size="sm" disabled className="opacity-50 cursor-not-allowed text-muted-foreground">
                  7d
                </Button>
                <Button variant="ghost" size="sm" disabled className="opacity-50 cursor-not-allowed text-muted-foreground">
                  30d
                </Button>
                <Button variant="ghost" size="sm" className="bg-accent text-accent-foreground">
                  All
                </Button>
              </div>
            </div>
            
            <TabsContent value="positions" className="space-y-4">
              <div className="space-y-2">
                {mockPositions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <div className="space-y-2 text-center py-8 text-muted-foreground">
                No open orders
              </div>
            </TabsContent>
            
            <TabsContent value="closed" className="space-y-4">
              <div className="space-y-2">
                {mockClosedTrades.map((trade) => (
                  <TradeHistoryCard key={trade.id} trade={trade} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const PositionCard: React.FC<{ position: Position }> = ({ position }) => {
  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors border border-border">
      <div className="space-y-3">
        {/* Header with symbol and PnL */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {position.symbol.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{position.symbol}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 ${
                    position.type === 'long' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}
                >
                  {position.type.toUpperCase()}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">Opened 13 Sep at 17:10</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-lg font-medium ${position.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {position.pnl > 0 ? '+' : ''}${Math.abs(position.pnl).toLocaleString()}
            </div>
            <div className={`text-sm flex items-center justify-end gap-1 ${position.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {position.pnl > 0 ? '▲' : '▼'} {Math.abs(position.pnlPercent).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Trading details grid */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Position Value</div>
            <div className="font-medium">${(position.size * position.currentPrice / position.entryPrice).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Size</div>
            <div className="font-medium">${position.size.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Entry Price</div>
            <div className="font-medium">${position.entryPrice.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Mark Price</div>
            <div className="font-medium">${position.currentPrice.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Liq. Price</div>
            <div className="font-medium">${(position.entryPrice * (position.type === 'long' ? 0.85 : 1.15)).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Funding</div>
            <div className="font-medium text-green-600">+$12.45</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

const TradeHistoryCard: React.FC<{ trade: ClosedTrade }> = ({ trade }) => {
  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors">
      <div className="space-y-3">
        {/* Header with symbol, direction, and timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                className={`text-xs ${
                  trade.type === 'long' 
                    ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' 
                    : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
                }`}
              >
                {trade.type === 'long' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {trade.type.toUpperCase()}
              </Badge>
              <span className="font-medium">{trade.symbol}</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Closed 13 Sep at 14:25
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-lg font-medium ${trade.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
            </div>
            <div className={`text-sm ${trade.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({trade.pnl > 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Trading details grid */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Size</div>
            <div className="font-medium">${trade.size.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Trade Value</div>
            <div className="font-medium">${(trade.size * trade.exitPrice).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Entry Price</div>
            <div className="font-medium">${trade.entryPrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Exit Price</div>
            <div className="font-medium">${trade.exitPrice.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}