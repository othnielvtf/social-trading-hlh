import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

const mockMarketData: MarketData[] = [
  {
    symbol: 'BTC-USD',
    price: 43200,
    change24h: 850,
    change24hPercent: 2.01,
    volume24h: 28500000000,
    high24h: 43450,
    low24h: 41900
  },
  {
    symbol: 'ETH-USD',
    price: 2387,
    change24h: -45,
    change24hPercent: -1.85,
    volume24h: 12800000000,
    high24h: 2420,
    low24h: 2365
  },
  {
    symbol: 'SOL-USD',
    price: 112.45,
    change24h: 3.2,
    change24hPercent: 2.93,
    volume24h: 1200000000,
    high24h: 115.20,
    low24h: 108.90
  }
];

export function Trade() {
  const [selectedMarket, setSelectedMarket] = useState('BTC-USD');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState('1');

  const selectedMarketData = mockMarketData.find(m => m.symbol === selectedMarket) || mockMarketData[0];

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-border p-4">
        <h2 className="text-xl">Trade</h2>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Left Panel - Market Data */}
          <div className="w-1/3 border-r border-border p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Markets</h3>
                <div className="space-y-2">
                  {mockMarketData.map((market) => (
                    <MarketCard 
                      key={market.symbol} 
                      market={market} 
                      isSelected={selectedMarket === market.symbol}
                      onSelect={() => setSelectedMarket(market.symbol)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Center Panel - Chart Placeholder */}
          <div className="flex-1 p-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedMarketData.symbol}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-2xl font-bold">
                      ${selectedMarketData.price.toLocaleString()}
                    </span>
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        selectedMarketData.change24hPercent > 0 
                          ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30' 
                          : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
                      }`}
                    >
                      {selectedMarketData.change24hPercent > 0 ? '+' : ''}
                      {selectedMarketData.change24hPercent.toFixed(2)}%
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                    <p>Trading Chart</p>
                    <p className="text-sm">Chart integration with Hyperliquid API</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Panel - Trading Interface */}
          <div className="w-80 border-l border-border p-4 overflow-y-auto">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Place Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trade Type */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={tradeType === 'long' ? 'default' : 'outline'}
                      onClick={() => setTradeType('long')}
                      className={tradeType === 'long' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Long
                    </Button>
                    <Button
                      variant={tradeType === 'short' ? 'destructive' : 'outline'}
                      onClick={() => setTradeType('short')}
                    >
                      <TrendingDown className="w-4 h-4 mr-1" />
                      Short
                    </Button>
                  </div>
                  
                  {/* Order Type */}
                  <div>
                    <Label>Order Type</Label>
                    <Select value={orderType} onValueChange={(value: 'market' | 'limit') => setOrderType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Size */}
                  <div>
                    <Label>Size (USD)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    />
                  </div>
                  
                  {/* Price (for limit orders) */}
                  {orderType === 'limit' && (
                    <div>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  )}
                  
                  {/* Leverage */}
                  <div>
                    <Label>Leverage</Label>
                    <Select value={leverage} onValueChange={setLeverage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                        <SelectItem value="5">5x</SelectItem>
                        <SelectItem value="10">10x</SelectItem>
                        <SelectItem value="20">20x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Order Summary */}
                  <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Est. Position Size:</span>
                      <span>{size ? `$${parseFloat(size).toLocaleString()}` : '$0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margin Required:</span>
                      <span>
                        {size && leverage ? 
                          `$${(parseFloat(size) / parseFloat(leverage)).toLocaleString()}` : 
                          '$0.00'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Leverage:</span>
                      <span>{leverage}x</span>
                    </div>
                  </div>
                  
                  <Button 
                    className={`w-full ${
                      tradeType === 'long' 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                    disabled={!size}
                  >
                    {tradeType === 'long' ? 'Buy' : 'Sell'} {selectedMarketData.symbol}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Market Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Market Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>24h High:</span>
                    <span>${selectedMarketData.high24h.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>24h Low:</span>
                    <span>${selectedMarketData.low24h.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>24h Volume:</span>
                    <span>${(selectedMarketData.volume24h / 1000000000).toFixed(1)}B</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketCard({ market, isSelected, onSelect }: { 
  market: MarketData; 
  isSelected: boolean; 
  onSelect: () => void; 
}) {
  return (
    <Card 
      className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
        isSelected ? 'bg-accent border-primary' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{market.symbol}</div>
          <div className="text-sm text-muted-foreground">
            ${market.price.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${
            market.change24hPercent > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {market.change24hPercent > 0 ? '+' : ''}
            {market.change24hPercent.toFixed(2)}%
          </div>
          <div className={`text-xs ${
            market.change24h > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {market.change24h > 0 ? '+' : ''}
            ${market.change24h.toFixed(0)}
          </div>
        </div>
      </div>
    </Card>
  );
}