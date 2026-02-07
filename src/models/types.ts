// Domain models - decoupled from API response shapes

export interface SearchResult {
  symbol: string;
  name: string;
  currency: string;
  exchangeShortName: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  dayLow: number;
  dayHigh: number;
  yearLow: number;
  yearHigh: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  pe: number | null;
  eps: number | null;
  exchange: string;
  timestamp: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: number;
}

export type NetworkState = 'idle' | 'loading' | 'success' | 'error';
