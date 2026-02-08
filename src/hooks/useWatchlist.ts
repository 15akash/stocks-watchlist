import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { watchlistStorage } from '../storage/watchlistStorage';
import { fmpClient } from '../api/fmpClient';
import { mapProfiles } from '../domain/mappers';
import type { WatchlistItem, StockQuote } from '../models/types';

const WATCHLIST_KEY = ['watchlistItems'] as const;

export function useWatchlist() {
  const queryClient = useQueryClient();

  // Shared watchlist items via React Query cache
  const itemsQuery = useQuery<WatchlistItem[]>({
    queryKey: WATCHLIST_KEY,
    queryFn: () => watchlistStorage.getAll(),
    staleTime: Infinity,
  });

  const items = itemsQuery.data ?? [];
  const symbols = items.map((i) => i.symbol);

  // Fetch profiles for all watchlist symbols
  const quotesQuery = useQuery<StockQuote[]>({
    queryKey: ['batchQuotes', symbols.join(',')],
    queryFn: async () => {
      if (symbols.length === 0) return [];
      const raw = await fmpClient.getBatchProfiles(symbols);
      return mapProfiles(raw);
    },
    enabled: symbols.length > 0,
    staleTime: 30_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });

  const addToWatchlist = useCallback(
    async (symbol: string, name: string) => {
      const updated = await watchlistStorage.addItem(symbol, name);
      queryClient.setQueryData(WATCHLIST_KEY, updated);
      queryClient.invalidateQueries({ queryKey: ['batchQuotes'] });
    },
    [queryClient],
  );

  const removeFromWatchlist = useCallback(
    async (symbol: string) => {
      const updated = await watchlistStorage.removeItem(symbol);
      queryClient.setQueryData(WATCHLIST_KEY, updated);
      queryClient.invalidateQueries({ queryKey: ['batchQuotes'] });
    },
    [queryClient],
  );

  const isInWatchlist = useCallback(
    (symbol: string) => items.some((i) => i.symbol === symbol),
    [items],
  );

  const refresh = useCallback(() => {
    return quotesQuery.refetch();
  }, [quotesQuery]);

  const quotesMap: Record<string, StockQuote> = {};
  (quotesQuery.data ?? []).forEach((q) => {
    quotesMap[q.symbol] = q;
  });

  return {
    items,
    quotesMap,
    isLoading: quotesQuery.isLoading,
    isRefreshing: quotesQuery.isFetching && !quotesQuery.isLoading,
    isError: quotesQuery.isError,
    error: quotesQuery.error,
    lastUpdated: quotesQuery.dataUpdatedAt ? new Date(quotesQuery.dataUpdatedAt) : null,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refresh,
  };
}
