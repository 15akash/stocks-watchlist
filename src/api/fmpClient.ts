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
  exchange: string;
}

export interface FMPProfile {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercentage: number;
  volume: number;
  averageVolume: number;
  marketCap: number;
  range: string; // "96.43-160.27"
  exchange: string;
  beta: number;
  industry: string;
  sector: string;
}

export const fmpClient = {
  async searchSymbol(query: string, limit = 10): Promise<FMPSearchResult[]> {
    // Search both by symbol and by name, then merge and deduplicate
    const [bySymbol, byName] = await Promise.all([
      request<FMPSearchResult[]>('/search-symbol', { query, limit: String(limit) }).catch(() => []),
      request<FMPSearchResult[]>('/search-name', { query, limit: String(limit) }).catch(() => []),
    ]);
    const seen = new Set<string>();
    const merged: FMPSearchResult[] = [];
    for (const item of [...bySymbol, ...byName]) {
      if (!seen.has(item.symbol)) {
        seen.add(item.symbol);
        merged.push(item);
      }
    }
    return merged.slice(0, limit);
  },

  getProfile(symbol: string): Promise<FMPProfile[]> {
    return request<FMPProfile[]>('/profile', { symbol });
  },

  async getBatchProfiles(symbols: string[]): Promise<FMPProfile[]> {
    // No batch-profile endpoint on free tier, fetch individually
    const results = symbols.map((s) =>
      request<FMPProfile[]>('/profile', { symbol: s })
        .then((arr) => arr[0] ?? null)
        .catch(() => null),
    );
    return Promise.all(results).then(
      (arr) => arr.filter((p): p is FMPProfile => p !== null),
    );
  },
};
