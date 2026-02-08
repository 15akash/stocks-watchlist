import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWatchlist } from '../hooks/useWatchlist';
import { StockCard } from '../components/StockCard';
import { ErrorRetry } from '../components/ErrorRetry';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { WatchlistItem } from '../models/types';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function WatchlistScreen() {
  const navigation = useNavigation<Nav>();
  const {
    items,
    quotesMap,
    isLoading,
    isRefreshing,
    isError,
    error,
    lastUpdated,
    removeFromWatchlist,
    refresh,
  } = useWatchlist();

  const handleRemove = useCallback(
    (symbol: string) => {
      Alert.alert('Remove from Watchlist', `Remove ${symbol}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromWatchlist(symbol),
        },
      ]);
    },
    [removeFromWatchlist],
  );

  const renderItem = useCallback(
    ({ item }: { item: WatchlistItem }) => {
      const quote = quotesMap[item.symbol];
      return (
        <StockCard
          symbol={item.symbol}
          name={item.name}
          price={quote?.price}
          change={quote?.change}
          changesPercentage={quote?.changesPercentage}
          onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol })}
          stale={!quote && !isLoading}
        />
      );
    },
    [quotesMap, navigation, isLoading],
  );

  if (items.length === 0 && !isLoading) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No stocks in watchlist</Text>
        <Text style={styles.emptySubtitle}>Search and add stocks to track them here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Watchlist</Text>
        <Text style={styles.count}>{items.length} stocks</Text>
      </View>

      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}

      {isLoading && items.length > 0 && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color={colors.textPrimary} />
          <Text style={styles.loadingText}>Loading quotes...</Text>
        </View>
      )}

      {isError && (
        <ErrorRetry
          message="Failed to load some quotes. Pull down to retry."
          onRetry={refresh}
        />
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.symbol}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.textPrimary} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: typography.headingLarge,
  count: { ...typography.bodySmall, color: colors.textMuted },
  lastUpdated: {
    ...typography.label,
    color: colors.textPlaceholder,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: typography.caption,
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { ...typography.headingSmall, marginBottom: 8 },
  emptySubtitle: { ...typography.subtitle, textAlign: 'center' },
});
