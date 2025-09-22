export type SpotClearinghouseStateRequest = {
  type: 'spotClearinghouseState';
  user: string; // 0x...
  dex: string; // can be empty
};

export type ClearinghouseStateRequest = {
  type: 'clearinghouseState';
  user: string;
  dex: string;
};

export type SpotBalance = {
  coin: string;
  token: number;
  total: string; // stringified number
  hold: string;
  entryNtl?: string;
};

export type SpotClearinghouseStateResponse = {
  balances: SpotBalance[];
};

export type MarginSummary = {
  accountValue: string;
  totalNtlPos: string;
  totalRawUsd: string;
  totalMarginUsed: string;
};

export type ClearinghouseStateResponse = {
  marginSummary: MarginSummary;
  crossMarginSummary: MarginSummary;
  crossMaintenanceMarginUsed: string;
  withdrawable: string;
  assetPositions: unknown[];
  time: number;
};

const HL_ENDPOINT = 'https://hyperliquid-testnet.core.chainstack.com/8f4f1d30c3f46fbe71038f1819efc218/info';
const HL_INFO_PUBLIC = 'https://api.hyperliquid.xyz/info';

async function postJSON<TReq extends object, TRes>(body: TReq): Promise<TRes> {
  const res = await fetch(HL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Hyperliquid API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<TRes>;
}

export async function fetchSpotClearinghouseState(user: string, dex: string = ''): Promise<SpotClearinghouseStateResponse> {
  return postJSON<SpotClearinghouseStateRequest, SpotClearinghouseStateResponse>({
    type: 'spotClearinghouseState',
    user,
    dex,
  });
}

export async function fetchClearinghouseState(user: string, dex: string = ''): Promise<ClearinghouseStateResponse> {
  return postJSON<ClearinghouseStateRequest, ClearinghouseStateResponse>({
    type: 'clearinghouseState',
    user,
    dex,
  });
}

export type AllMidsResponse = Record<string, string>; // keys like "@1": "1.0936"

export async function fetchAllMids(dex: string = ''): Promise<AllMidsResponse> {
  const res = await fetch(HL_INFO_PUBLIC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'allMids', dex }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Hyperliquid allMids error ${res.status}: ${text}`);
  }
  return res.json() as Promise<AllMidsResponse>;
}
