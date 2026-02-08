export interface SearchResult {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  yearLow: number;
  yearHigh: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  exchange: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: number;
}

export type NetworkState = 'idle' | 'loading' | 'success' | 'error';
