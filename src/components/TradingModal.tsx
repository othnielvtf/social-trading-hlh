import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TradingModal({ isOpen, onClose }: TradingModalProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('BTC-USD');
  const [leverage, setLeverage] = useState('1');

  const assets = [
    { symbol: 'BTC-USD', name: 'Bitcoin', price: 42150, change: 0.36 },
    { symbol: 'ETH-USD', name: 'Ethereum', price: 2387, change: -1.24 },
    { symbol: 'SOL-USD', name: 'Solana', price: 118, change: 5.67 },
    { symbol: 'AVAX-USD', name: 'Avalanche', price: 35.42, change: 2.18 },
  ];

  const selectedAssetData = assets.find(asset => asset.symbol === selectedAsset);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the trade execution
    console.log('Trade executed:', {
      asset: selectedAsset,
      side,
      orderType,
      amount,
      price: orderType === 'limit' ? price : selectedAssetData?.price
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        <VisuallyHidden.Root>
          <DialogTitle>Trade Terminal</DialogTitle>
          <DialogDescription>
            Select an asset and configure your trade order
          </DialogDescription>
        </VisuallyHidden.Root>

        <div className="p-6 pt-4">
          {/* Asset Selection */}
          <div className="mb-6">
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                    <div className="flex items-center justify-between w-full">
                      <span>{asset.name}</span>
                      <div className="ml-4 text-right">
                        <span className="font-medium">${asset.price.toLocaleString()}</span>
                        <span className={`ml-2 text-xs ${
                          asset.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {asset.change > 0 ? '+' : ''}{asset.change}%
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Price Display */}
          {selectedAssetData && (
            <Card className="mb-6 bg-accent/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{selectedAssetData.name}</h3>
                    <p className="text-2xl font-bold">${selectedAssetData.price.toLocaleString()}</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={selectedAssetData.change > 0 
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30'
                      : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
                    }
                  >
                    {selectedAssetData.change > 0 ? '+' : ''}{selectedAssetData.change}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Buy/Sell Toggle */}
            <Tabs value={side} onValueChange={(value) => setSide(value as 'buy' | 'sell')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="buy" 
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Buy
                </TabsTrigger>
                <TabsTrigger 
                  value="sell"
                  className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Sell
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Order Type */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Order Type</Label>
              <Select value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market Order</SelectItem>
                  <SelectItem value="limit" disabled className="text-muted-foreground">Limit Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leverage */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Leverage</Label>
              <Select value={leverage} onValueChange={setLeverage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="3">3x</SelectItem>
                  <SelectItem value="5">5x</SelectItem>
                  <SelectItem value="10">10x</SelectItem>
                  <SelectItem value="20">20x</SelectItem>
                  <SelectItem value="50">50x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Limit Price (only for limit orders) */}
            {orderType === 'limit' && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Limit Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder={selectedAssetData?.price.toString() || "0.00"}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Order Summary */}
            <Card className="bg-accent/30">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order Type:</span>
                    <span className="font-medium">{orderType === 'market' ? 'Market' : 'Limit'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Side:</span>
                    <span className={`font-medium ${side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                      {side.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">${amount || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leverage:</span>
                    <span className="font-medium">{leverage}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Position Size:</span>
                    <span className="font-medium">${amount && leverage ? (parseFloat(amount) * parseFloat(leverage)).toLocaleString() : '0.00'}</span>
                  </div>
                  {orderType === 'limit' && (
                    <div className="flex justify-between">
                      <span>Limit Price:</span>
                      <span className="font-medium">${price || selectedAssetData?.price.toLocaleString() || '0.00'}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className={`w-full ${
                side === 'buy' 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              disabled={!amount}
            >
              {side === 'buy' ? 'Buy' : 'Sell'} {selectedAsset.split('-')[0]}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}