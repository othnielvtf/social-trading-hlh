import React, { useMemo, useState } from 'react';
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
import { useWallets } from '@privy-io/react-auth';
import { fetchAllMids } from '../utils/hyperliquid';
import { showToast } from '../utils/toast';

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
  const { wallets } = useWallets();
  const activeWallet = wallets?.[0];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const assets = [
    { symbol: 'BTC-USD', name: 'Bitcoin', price: 42150, change: 0.36 },
    { symbol: 'ETH-USD', name: 'Ethereum', price: 2387, change: -1.24 },
    { symbol: 'SOL-USD', name: 'Solana', price: 118, change: 5.67 },
    { symbol: 'AVAX-USD', name: 'Avalanche', price: 35.42, change: 2.18 },
  ];

  const selectedAssetData = assets.find(asset => asset.symbol === selectedAsset);

  // Map UI symbols to builder API symbols (define early so hooks below can use it)
  const mapToPerp = (symbol: string) => {
    if (symbol.endsWith('-USD')) return symbol.replace('-USD', '-PERP');
    return symbol;
  };

  // Live mid prices from Hyperliquid
  const [mids, setMids] = useState<Record<string, number> | null>(null);
  const currentMid = useMemo(() => {
    if (!mids) return undefined;
    const perp = mapToPerp(selectedAsset); // e.g., BTC-PERP
    const base = perp.replace(/-PERPS?$/i, '').replace(/-PERP$/i, '');
    return mids[perp] ?? mids[base] ?? mids[`@${perp}`];
  }, [mids, selectedAsset]);

  // Fetch mids on open
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
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
      } catch (e) {
        // non-fatal
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  // API and builder config (could be env-driven)
  const builderApi = 'https://hl-builder-hack-production.up.railway.app/order';
  const builderAddress = '0x96825c1152C919E185F0397CA7703b8A6B58BC9C';
  const userAddress = activeWallet?.address;

  // mapToPerp defined above

  // Construct a canonical payload for signing
  const orderPayload = useMemo(() => {
    const isBuy = side === 'buy';
    const isMarketUI = orderType === 'market';
    const name = mapToPerp(selectedAsset); // builder expects *-PERP
    const rawSz = amount ? parseFloat(amount) : 0;
    // For market orders, send a numeric limitPx near the mid to cross the book
    // and avoid exceeding the 80% away constraint.
    // - Sell: mid * 0.99
    // - Buy:  mid * 1.01
    const referencePx = (currentMid ?? selectedAssetData?.price);
    // Tick size per symbol (best-effort defaults), overridable via env
    const env = (import.meta as any).env || {};
    const envTick = (key: string) => env[key] ? parseFloat(env[key]) : undefined;
    const tickSizeMap: Record<string, number> = {
      'BTC-PERP': envTick('VITE_TICK_BTC_PERP') ?? 0.5,
      'ETH-PERP': envTick('VITE_TICK_ETH_PERP') ?? 0.5,
      'SOL-PERP': envTick('VITE_TICK_SOL_PERP') ?? 0.001,
      'AVAX-PERP': envTick('VITE_TICK_AVAX_PERP') ?? 0.001,
    };
    const tick = tickSizeMap[name] ?? (envTick('VITE_TICK_DEFAULT') ?? 0.01);
    const snapToTickAggressive = (p: number) => {
      if (!isFinite(p) || p <= 0) return p;
      const q = p / tick;
      // bias to reduce FP crossing issues
      const biasedQ = side === 'sell' ? q + 1e-9 : q - 1e-9;
      let units = side === 'sell' ? Math.floor(biasedQ) : Math.ceil(biasedQ);
      if (!Number.isFinite(units)) units = 1;
      let snapped = units * tick;
      const decimals = (tick.toString().split('.')[1]?.length) ?? 0;
      let fixed = parseFloat(snapped.toFixed(decimals));
      // Ensure exact divisibility: adjust by one unit if modulo check fails due to FP
      const mod = fixed / tick;
      const modFrac = Math.abs(mod - Math.round(mod));
      if (modFrac > 1e-9) {
        units = side === 'sell' ? units - 1 : units + 1;
        snapped = units * tick;
        fixed = parseFloat(snapped.toFixed(decimals));
      }
      return fixed > 0 ? fixed : tick;
    };
    const marketCrossPxRaw = referencePx
      ? (side === 'sell' ? referencePx * 0.99 : referencePx * 1.01)
      : (side === 'sell' ? 1 : 1e12); // final fallback if no reference
    const limitPxRaw = isMarketUI
      ? marketCrossPxRaw
      : (price ? parseFloat(price) : (referencePx ?? 0));
    const limitPx = snapToTickAggressive(limitPxRaw);
    // Round size to symbol step size (best-effort defaults)
    const stepSizeMap: Record<string, number> = {
      'BTC-PERP': 0.001,
      'ETH-PERP': 0.001,
      'SOL-PERP': 0.01,
      'AVAX-PERP': 0.01,
    };
    const step = stepSizeMap[name] ?? 0.001;
    const roundSize = (s: number) => {
      if (!isFinite(s) || s <= 0) return s;
      const units = Math.floor(s / step);
      const snapped = units * step;
      const decimals = (step.toString().split('.')[1]?.length) ?? 0;
      const fixed = parseFloat(snapped.toFixed(decimals));
      return fixed > 0 ? fixed : step; // ensure non-zero minimum
    };
    const sz = roundSize(rawSz);

    // For builder compatibility: when UI selects Market, send crossing limit order (isMarket=false)
    const isMarket = false;
    return {
      name,
      isBuy,
      sz,
      limitPx: limitPx ?? null,
      tif: 'Gtc',
      feeTenths: 10,
      isMarket,
      builderAddress,
      userAddress: userAddress || ''
    };
  }, [side, orderType, selectedAsset, amount, price, currentMid, selectedAssetData, builderAddress, userAddress]);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWallet || !userAddress) {
      console.error('No connected wallet found.');
      return;
    }
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      // DEBUG: surface price/tick info to help align with venue
      try {
        const name = mapToPerp(selectedAsset);
        const env = (import.meta as any).env || {};
        const envTick = (key: string) => env[key] ? parseFloat(env[key]) : undefined;
        const tickSizeMap: Record<string, number> = {
          'BTC-PERP': envTick('VITE_TICK_BTC_PERP') ?? 0.5,
          'ETH-PERP': envTick('VITE_TICK_ETH_PERP') ?? 0.5,
          'SOL-PERP': envTick('VITE_TICK_SOL_PERP') ?? 0.001,
          'AVAX-PERP': envTick('VITE_TICK_AVAX_PERP') ?? 0.001,
        };
        const tick = tickSizeMap[name] ?? (envTick('VITE_TICK_DEFAULT') ?? 0.01);
        const px = orderPayload.limitPx ?? 0;
        const units = tick ? (px / tick) : 0;
        showToast({
          variant: 'default',
          title: 'Debug price',
          description: `${name} px=${px} tick=${tick} units=${units}`
        });
        // eslint-disable-next-line no-console
        console.debug('[TradingModal] price debug', { name, px, tick, units });
      } catch {}
      // 1) Approve builder fee via our secure API (server-side PK)
      setIsApproving(true);
      const approveEndpoint: string | undefined = (import.meta as any).env?.VITE_APPROVE_URL;
      if (!approveEndpoint) {
        throw new Error('Missing VITE_APPROVE_URL env. Set it to your backend /approveSigned endpoint URL.');
      }
      const approvePayloadNoSig = {
        userAddress,
        builderAddress,
        maxBuilderFee: 10,
      };
      const approveToSign = JSON.stringify(approvePayloadNoSig, Object.keys(approvePayloadNoSig).sort());
      let approveSignature: string | undefined;
      // Prefer wallet.signMessage; fallback to EIP-1193 personal_sign
      // @ts-ignore
      if (typeof activeWallet.signMessage === 'function') {
        // @ts-ignore
        approveSignature = await activeWallet.signMessage(approveToSign);
      } else if (typeof activeWallet.getEthereumProvider === 'function') {
        // @ts-ignore
        const ethProvider = await activeWallet.getEthereumProvider();
        // personal_sign expects [message, from]
        approveSignature = await ethProvider.request({ method: 'personal_sign', params: [approveToSign, userAddress] });
      }
      if (!approveSignature) {
        throw new Error('Unable to sign approval with wallet');
      }
      const approveRes = await fetch(approveEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...approvePayloadNoSig, signature: approveSignature }),
      });
      if (!approveRes.ok) {
        const text = await approveRes.text();
        throw new Error(`Approve failed (${approveEndpoint}): ${approveRes.status} ${text}`);
      }
      setIsApproving(false);
      // Create a deterministic string to sign (sorted keys)
      const toSign = JSON.stringify(orderPayload, Object.keys(orderPayload).sort());
      // Prefer native wallet.signMessage if available, otherwise ethers signer
      let signature: string | undefined;
      // @ts-ignore - privy wallet may expose signMessage
      if (typeof activeWallet.signMessage === 'function') {
        // @ts-ignore
        signature = await activeWallet.signMessage(toSign);
      } else if (typeof activeWallet.getEthereumProvider === 'function') {
        // Use EIP-1193 provider to sign
        // @ts-ignore
        const ethProvider = await activeWallet.getEthereumProvider();
        const from = userAddress;
        // Some providers expect params [message, from] or [from, message]. Try personal_sign with [message, from].
        signature = await ethProvider.request({
          method: 'personal_sign',
          params: [toSign, from],
        });
      }
      if (!signature) {
        throw new Error('Unable to sign order with wallet');
      }

      const body: any = { ...orderPayload, signature };

      // 2) Send signed order to backend
      const orderEndpoint: string | undefined = (import.meta as any).env?.VITE_ORDER_URL;
      if (!orderEndpoint) {
        throw new Error('Missing VITE_ORDER_URL env. Set it to your backend /orderSigned endpoint URL.');
      }
      const res = await fetch(orderEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Order failed (${orderEndpoint}): ${res.status} ${text}`);
      }
      const data = await res.json().catch(() => ({}));
      console.log('Order submitted:', data);
      showToast({ variant: 'success', title: 'Order submitted', description: `${orderPayload.name} ${orderPayload.isBuy ? 'buy' : 'sell'} ${orderPayload.sz}` });
      onClose();
    } catch (err) {
      console.error('Error submitting order:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setSubmitError(msg);
      showToast({ variant: 'error', title: 'Order failed', description: msg });
    }
    finally {
      setIsSubmitting(false);
      setIsApproving(false);
    }
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

          {/* Current Price Display (live mid if available) */}
          <Card className="mb-6 bg-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedAssetData?.name || selectedAsset}</h3>
                  <p className="text-2xl font-bold">
                    ${ (currentMid ?? selectedAssetData?.price ?? 0).toLocaleString() }
                  </p>
                </div>
                {typeof selectedAssetData?.change === 'number' && (
                  <Badge 
                    variant="outline"
                    className={selectedAssetData.change > 0 
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30'
                      : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
                    }
                  >
                    {selectedAssetData.change > 0 ? '+' : ''}{selectedAssetData.change}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

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

            {/* Error Feedback */}
            {submitError && (
              <div className="text-sm text-red-600 dark:text-red-400">{submitError}</div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className={`w-full ${
                side === 'buy' 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              disabled={!amount || isSubmitting || isApproving}
            >
              {isApproving ? 'Approving…' : isSubmitting ? 'Submitting…' : `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedAsset.split('-')[0]}`}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}