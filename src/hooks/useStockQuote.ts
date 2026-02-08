import { useQuery } from '@tanstack/react-query';
import { fmpClient } from '../api/fmpClient';
import { mapProfile } from '../domain/mappers';
import type { StockQuote } from '../models/types';

export function useStockQuote(symbol: string) {
  return useQuery<StockQuote | null>({
    queryKey: ['quote', symbol],
    queryFn: async () => {
      const raw = await fmpClient.getProfile(symbol);
      if (!raw || raw.length === 0) return null;
      return mapProfile(raw[0]);
    },
    enabled: !!symbol,
    staleTime: 30_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}
