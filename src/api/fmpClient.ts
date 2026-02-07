/**
 * FMP API Client
 *
 * Handles all communication with Financial Modeling Prep's stable API.
 * API key is read from Expo Constants (extra config) at runtime.
 */

import Constants from 'expo-constants';

const BASE_URL = 'https://financialmodelingprep.com/stable';

function getApiKey(): string {
  const key = Constants.expoConfig?.extra?.fmpApiKey ?? '';
  if (!key) {
    console.warn('FMP API key is not configured. Set FMP_API_KEY env variable.');
  }
  return key;
}

class FMPClientError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'FMPClientError';
  }
}

async function request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('apikey', getApiKey());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new FMPClientError(`API error: ${response.status}`, response.status);
    }

    const data = await response.json();

    // FMP sometimes returns { "Error Message": "..." } with 200 status
    if (data && typeof data === 'object' && 'Error Message' in data) {
      throw new FMPClientError(data['Error Message']);
    }

    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new FMPClientError('Request timed out');
    }
    if (err instanceof FMPClientError) throw err;
    const message = err instanceof Error ? err.message : 'Network error';
    throw new FMPClientError(message);
  }
}

// Raw API response types (kept private to this module)
export interface FMPSearchResult {
  symbol: string;
  name: string;
  currency: string;
  exchangeShortName: string;
}

export interface FMPQuote {
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
  pe: number;
  eps: number;
  exchange: string;
  timestamp: number;
}

export const fmpClient = {
  searchSymbol(query: string, limit = 10): Promise<FMPSearchResult[]> {
    return request<FMPSearchResult[]>('/search-symbol', {
      query,
      limit: String(limit),
    });
  },

  getQuote(symbol: string): Promise<FMPQuote[]> {
    return request<FMPQuote[]>('/quote', { symbol });
  },

  getBatchQuotes(symbols: string[]): Promise<FMPQuote[]> {
    return request<FMPQuote[]>('/batch-quote', {
      symbols: symbols.join(','),
    });
  },
};
