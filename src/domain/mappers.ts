import type { FMPProfile, FMPSearchResult } from '../api/fmpClient';
import type { SearchResult, StockQuote } from '../models/types';

export function mapSearchResult(raw: FMPSearchResult): SearchResult {
  return {
    symbol: raw.symbol ?? '',
    name: raw.name ?? '',
    currency: raw.currency ?? 'USD',
    exchange: raw.exchange ?? '',
  };
}

export function mapSearchResults(raw: FMPSearchResult[]): SearchResult[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapSearchResult);
}

function parseRange(range: string): { yearLow: number; yearHigh: number } {
  const parts = (range ?? '').split('-');
  return {
    yearLow: parseFloat(parts[0]) || 0,
    yearHigh: parseFloat(parts[1]) || 0,
  };
}

export function mapProfile(raw: FMPProfile): StockQuote {
  const { yearLow, yearHigh } = parseRange(raw.range);
  return {
    symbol: raw.symbol ?? '',
    name: raw.companyName ?? '',
    price: raw.price ?? 0,
    change: raw.change ?? 0,
    changesPercentage: raw.changePercentage ?? 0,
    yearLow,
    yearHigh,
    marketCap: raw.marketCap ?? 0,
    volume: raw.volume ?? 0,
    avgVolume: raw.averageVolume ?? 0,
    exchange: raw.exchange ?? '',
  };
}

export function mapProfiles(raw: FMPProfile[]): StockQuote[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapProfile);
}
