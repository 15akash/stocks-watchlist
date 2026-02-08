import { mapSearchResult, mapSearchResults, mapProfile, mapProfiles } from '../src/domain/mappers';
import type { FMPProfile, FMPSearchResult } from '../src/api/fmpClient';

describe('mapSearchResult', () => {
  it('maps a valid FMP search result to domain model', () => {
    const raw: FMPSearchResult = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      currency: 'USD',
      exchange: 'NASDAQ',
    };

    const result = mapSearchResult(raw);

    expect(result).toEqual({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      currency: 'USD',
      exchange: 'NASDAQ',
    });
  });

  it('handles missing fields with defaults', () => {
    const raw = {} as FMPSearchResult;
    const result = mapSearchResult(raw);

    expect(result.symbol).toBe('');
    expect(result.name).toBe('');
    expect(result.currency).toBe('USD');
    expect(result.exchange).toBe('');
  });
});

describe('mapSearchResults', () => {
  it('maps an array of search results', () => {
    const raw: FMPSearchResult[] = [
      { symbol: 'AAPL', name: 'Apple', currency: 'USD', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla', currency: 'USD', exchange: 'NASDAQ' },
    ];

    const results = mapSearchResults(raw);
    expect(results).toHaveLength(2);
    expect(results[0].symbol).toBe('AAPL');
    expect(results[1].symbol).toBe('TSLA');
  });

  it('returns empty array for non-array input', () => {
    expect(mapSearchResults(null as unknown as FMPSearchResult[])).toEqual([]);
    expect(mapSearchResults(undefined as unknown as FMPSearchResult[])).toEqual([]);
  });
});

describe('mapProfile', () => {
  it('maps a full FMP profile to domain model', () => {
    const raw: FMPProfile = {
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      price: 175.43,
      change: 4.21,
      changePercentage: 2.31,
      volume: 48200000,
      averageVolume: 52800000,
      marketCap: 2710000000000,
      range: '164.08-199.62',
      exchange: 'NASDAQ',
      beta: 1.29,
      industry: 'Consumer Electronics',
      sector: 'Technology',
    };

    const result = mapProfile(raw);

    expect(result.symbol).toBe('AAPL');
    expect(result.name).toBe('Apple Inc.');
    expect(result.price).toBe(175.43);
    expect(result.change).toBe(4.21);
    expect(result.changesPercentage).toBe(2.31);
    expect(result.yearLow).toBe(164.08);
    expect(result.yearHigh).toBe(199.62);
    expect(result.volume).toBe(48200000);
    expect(result.avgVolume).toBe(52800000);
  });

  it('handles missing fields with defaults', () => {
    const raw = {} as FMPProfile;
    const result = mapProfile(raw);

    expect(result.symbol).toBe('');
    expect(result.name).toBe('');
    expect(result.price).toBe(0);
    expect(result.yearLow).toBe(0);
    expect(result.yearHigh).toBe(0);
  });

  it('parses range string into yearLow and yearHigh', () => {
    const raw = { range: '96.43-160.27' } as FMPProfile;
    const result = mapProfile(raw);

    expect(result.yearLow).toBe(96.43);
    expect(result.yearHigh).toBe(160.27);
  });
});

describe('mapProfiles', () => {
  it('returns empty array for non-array input', () => {
    expect(mapProfiles(null as unknown as FMPProfile[])).toEqual([]);
  });
});
