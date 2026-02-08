import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fmpClient } from '../api/fmpClient';
import { mapSearchResults } from '../domain/mappers';

export function useSearchStocks() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setDebouncedQuery('');
      return;
    }

    timerRef.current = setTimeout(() => {
      // Cancel any previous in-flight search query
      queryClient.cancelQueries({ queryKey: ['search'] });
      setDebouncedQuery(query.trim());
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, queryClient]);

  const result = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async ({ signal }) => {
      const raw = await fmpClient.searchSymbol(debouncedQuery);
      // Respect cancellation
      if (signal?.aborted) throw new Error('Cancelled');
      return mapSearchResults(raw);
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 30_000,
    retry: 1,
  });

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    results: result.data ?? [],
    isLoading: result.isLoading && debouncedQuery.length > 0,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    clearSearch,
    hasSearched: debouncedQuery.length > 0,
  };
}
