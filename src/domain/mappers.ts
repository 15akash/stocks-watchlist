/**
 * Domain mappers: transform raw API responses to domain models.
 * Keeps API shape isolated from the rest of the app.
 */

import type { FMPQuote, FMPSearchResult } from '../api/fmpClient';
import type { SearchResult, StockQuote } from '../models/types';

export function mapSearchResult(raw: FMPSearchResult): SearchResult {
  return {
    symbol: raw.symbol ?? '',
    name: raw.name ?? '',
    currency: raw.currency ?? 'USD',
    exchangeShortName: raw.exchangeShortName ?? '',
  };
}

export function mapSearchResults(raw: FMPSearchResult[]): SearchResult[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapSearchResult);
}

export function mapQuote(raw: FMPQuote): StockQuote {
  return {
    symbol: raw.symbol ?? '',
    name: raw.name ?? '',
    price: raw.price ?? 0,
    change: raw.change ?? 0,
    changesPercentage: raw.changesPercentage ?? 0,
    dayLow: raw.dayLow ?? 0,
    dayHigh: raw.dayHigh ?? 0,
    yearLow: raw.yearLow ?? 0,
    yearHigh: raw.yearHigh ?? 0,
    marketCap: raw.marketCap ?? 0,
    volume: raw.volume ?? 0,
    avgVolume: raw.avgVolume ?? 0,
    open: raw.open ?? 0,
    previousClose: raw.previousClose ?? 0,
    pe: raw.pe ?? null,
    eps: raw.eps ?? null,
    exchange: raw.exchange ?? '',
    timestamp: raw.timestamp ?? Date.now(),
  };
}

export function mapQuotes(raw: FMPQuote[]): StockQuote[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(mapQuote);
}
