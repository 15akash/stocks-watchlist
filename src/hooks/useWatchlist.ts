import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { watchlistStorage } from '../storage/watchlistStorage';
import { fmpClient } from '../api/fmpClient';
import { mapQuotes } from '../domain/mappers';
import type { WatchlistItem, StockQuote } from '../models/types';

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  // Load watchlist from storage on mount
  useEffect(() => {
    watchlistStorage.getAll().then(setItems);
  }, []);

  const symbols = items.map((i) => i.symbol);

  // Fetch batch quotes for all watchlist symbols
  const quotesQuery = useQuery<StockQuote[]>({
    queryKey: ['batchQuotes', symbols.join(',')],
    queryFn: async () => {
      if (symbols.length === 0) return [];
      const raw = await fmpClient.getBatchQuotes(symbols);
      return mapQuotes(raw);
    },
    enabled: symbols.length > 0,
    staleTime: 30_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });

  // Update lastUpdated on successful fetch
  useEffect(() => {
    if (quotesQuery.isSuccess) {
      setLastUpdated(new Date());
    }
  }, [quotesQuery.isSuccess, quotesQuery.dataUpdatedAt]);

  const addToWatchlist = useCallback(
    async (symbol: string, name: string) => {
      const updated = await watchlistStorage.addItem(symbol, name);
      setItems(updated);
      // Invalidate batch quotes so they refresh
      queryClient.invalidateQueries({ queryKey: ['batchQuotes'] });
    },
    [queryClient],
  );

  const removeFromWatchlist = useCallback(
    async (symbol: string) => {
      const updated = await watchlistStorage.removeItem(symbol);
      setItems(updated);
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

  // Build a map: symbol -> quote for easy lookup
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
    lastUpdated,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refresh,
  };
}
