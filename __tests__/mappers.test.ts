import { mapSearchResult, mapSearchResults, mapQuote, mapQuotes } from '../src/domain/mappers';
import type { FMPQuote, FMPSearchResult } from '../src/api/fmpClient';

describe('mapSearchResult', () => {
  it('maps a valid FMP search result to domain model', () => {
    const raw: FMPSearchResult = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      currency: 'USD',
      exchangeShortName: 'NASDAQ',
    };

    const result = mapSearchResult(raw);

    expect(result).toEqual({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      currency: 'USD',
      exchangeShortName: 'NASDAQ',
    });
  });

  it('handles missing fields with defaults', () => {
    const raw = {} as FMPSearchResult;
    const result = mapSearchResult(raw);

    expect(result.symbol).toBe('');
    expect(result.name).toBe('');
    expect(result.currency).toBe('USD');
    expect(result.exchangeShortName).toBe('');
  });
});

describe('mapSearchResults', () => {
  it('maps an array of search results', () => {
    const raw: FMPSearchResult[] = [
      { symbol: 'AAPL', name: 'Apple', currency: 'USD', exchangeShortName: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla', currency: 'USD', exchangeShortName: 'NASDAQ' },
    ];

    const results = mapSearchResults(raw);
    expect(results).toHaveLength(2);
    expect(results[0].symbol).toBe('AAPL');
    expect(results[1].symbol).toBe('TSLA');
  });

  it('returns empty array for non-array input', () => {
    // Deliberately passing invalid types to test defensive handling
    expect(mapSearchResults(null as unknown as FMPSearchResult[])).toEqual([]);
    expect(mapSearchResults(undefined as unknown as FMPSearchResult[])).toEqual([]);
  });
});

describe('mapQuote', () => {
  it('maps a full FMP quote to domain model', () => {
    const raw: FMPQuote = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.43,
      change: 4.21,
      changesPercentage: 2.31,
      dayLow: 172.0,
      dayHigh: 176.5,
      yearLow: 164.08,
      yearHigh: 199.62,
      marketCap: 2710000000000,
      volume: 48200000,
      avgVolume: 52800000,
      open: 173.5,
      previousClose: 171.22,
      pe: 28.42,
      eps: 6.17,
      exchange: 'NASDAQ',
      timestamp: 1704571200,
    };

    const result = mapQuote(raw);

    expect(result.symbol).toBe('AAPL');
    expect(result.price).toBe(175.43);
    expect(result.change).toBe(4.21);
    expect(result.pe).toBe(28.42);
    expect(result.yearHigh).toBe(199.62);
  });

  it('handles missing pe/eps as null', () => {
    const raw = { symbol: 'TEST' } as FMPQuote;
    const result = mapQuote(raw);

    expect(result.pe).toBeNull();
    expect(result.eps).toBeNull();
  });
});

describe('mapQuotes', () => {
  it('returns empty array for non-array input', () => {
    // Deliberately passing invalid type to test defensive handling
    expect(mapQuotes(null as unknown as FMPQuote[])).toEqual([]);
  });
});
