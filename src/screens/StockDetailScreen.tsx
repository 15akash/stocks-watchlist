import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useStockQuote } from '../hooks/useStockQuote';
import { useWatchlist } from '../hooks/useWatchlist';
import { ErrorRetry } from '../components/ErrorRetry';
import type { StockQuote } from '../models/types';
import type { RootStackParamList } from '../navigation/types';

type StockDetailRouteProp = RouteProp<RootStackParamList, 'StockDetail'>;

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

function formatVolume(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

/**
 * Computes a meaningful insight based on quote data.
 */
function computeInsight(quote: StockQuote): { title: string; description: string } {
  // 52-week range position
  const range = quote.yearHigh - quote.yearLow;
  if (range > 0) {
    const position = ((quote.price - quote.yearLow) / range) * 100;
    const posLabel = position.toFixed(0);

    if (position > 90) {
      return {
        title: 'Near 52-Week High',
        description: `Trading at ${posLabel}% of its 52-week range ($${quote.yearLow.toFixed(2)} – $${quote.yearHigh.toFixed(2)}). The stock is close to its yearly high, which may signal strong momentum or overbought conditions.`,
      };
    }
    if (position < 10) {
      return {
        title: 'Near 52-Week Low',
        description: `Trading at ${posLabel}% of its 52-week range ($${quote.yearLow.toFixed(2)} – $${quote.yearHigh.toFixed(2)}). The stock is near its yearly low, which could represent a value opportunity or ongoing weakness.`,
      };
    }

    // Volume insight
    if (quote.avgVolume > 0) {
      const volumeRatio = quote.volume / quote.avgVolume;
      if (volumeRatio > 1.5) {
        return {
          title: 'Unusual Volume',
          description: `Today's volume (${formatVolume(quote.volume)}) is ${volumeRatio.toFixed(1)}x the average (${formatVolume(quote.avgVolume)}), indicating heightened trader interest.`,
        };
      }
    }

    // Default: range position
    return {
      title: '52-Week Range Position',
      description: `Currently at ${posLabel}% of its 52-week range ($${quote.yearLow.toFixed(2)} – $${quote.yearHigh.toFixed(2)}). Today's change: ${quote.change >= 0 ? '+' : ''}$${quote.change.toFixed(2)} (${quote.changesPercentage >= 0 ? '+' : ''}${quote.changesPercentage.toFixed(2)}%).`,
    };
  }

  return {
    title: 'Market Data',
    description: `Current price: $${quote.price.toFixed(2)} with a daily change of ${quote.change >= 0 ? '+' : ''}$${quote.change.toFixed(2)}.`,
  };
}

export function StockDetailScreen() {
  const route = useRoute<StockDetailRouteProp>();
  const symbol: string = route.params?.symbol ?? '';

  const { data: quote, isLoading, isError, refetch } = useStockQuote(symbol);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(symbol);

  const handleToggleWatchlist = useCallback(() => {
    if (inWatchlist) {
      Alert.alert('Remove from Watchlist', `Remove ${symbol}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromWatchlist(symbol) },
      ]);
    } else {
      addToWatchlist(symbol, quote?.name ?? symbol);
      Alert.alert('Added', `${symbol} added to watchlist.`);
    }
  }, [inWatchlist, symbol, quote, addToWatchlist, removeFromWatchlist]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#171717" />
        <Text style={styles.loadingText}>Loading quote...</Text>
      </View>
    );
  }

  if (isError) {
    return <ErrorRetry message="Failed to load stock data." onRetry={refetch} />;
  }

  if (!quote) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noDataText}>No data available for {symbol}</Text>
      </View>
    );
  }

  const isPositive = quote.change >= 0;
  const insight = computeInsight(quote);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Price Header */}
      <View style={styles.priceSection}>
        <View style={styles.priceHeader}>
          <View>
            <Text style={styles.price}>${quote.price.toFixed(2)}</Text>
            <View style={styles.changeRow}>
              <Text style={[styles.changeText, isPositive ? styles.positive : styles.negative]}>
                {isPositive ? '+' : ''}${quote.change.toFixed(2)}
              </Text>
              <Text style={[styles.changeText, isPositive ? styles.positive : styles.negative]}>
                ({isPositive ? '+' : ''}{quote.changesPercentage.toFixed(2)}%)
              </Text>
            </View>
          </View>
          <View style={styles.symbolBadge}>
            <Text style={styles.symbolBadgeText}>{symbol}</Text>
          </View>
        </View>
        <Text style={styles.companyName}>{quote.name}</Text>
        <Text style={styles.exchange}>{quote.exchange}</Text>
      </View>

      {/* Watchlist Toggle */}
      <TouchableOpacity
        style={[styles.watchlistButton, inWatchlist && styles.watchlistButtonActive]}
        onPress={handleToggleWatchlist}
        activeOpacity={0.7}
      >
        <Text style={[styles.watchlistButtonText, inWatchlist && styles.watchlistButtonTextActive]}>
          {inWatchlist ? '★ In Watchlist' : '☆ Add to Watchlist'}
        </Text>
      </TouchableOpacity>

      {/* Key Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Statistics</Text>
        <View style={styles.statsGrid}>
          <StatBox label="Market Cap" value={formatMarketCap(quote.marketCap)} />
          <StatBox label="P/E Ratio" value={quote.pe != null ? quote.pe.toFixed(2) : 'N/A'} />
          <StatBox label="52W High" value={`$${quote.yearHigh.toFixed(2)}`} />
          <StatBox label="52W Low" value={`$${quote.yearLow.toFixed(2)}`} />
          <StatBox label="Volume" value={formatVolume(quote.volume)} />
          <StatBox label="Avg Volume" value={formatVolume(quote.avgVolume)} />
          <StatBox label="Day High" value={`$${quote.dayHigh.toFixed(2)}`} />
          <StatBox label="Day Low" value={`$${quote.dayLow.toFixed(2)}`} />
          <StatBox label="Open" value={`$${quote.open.toFixed(2)}`} />
          <StatBox label="Prev Close" value={`$${quote.previousClose.toFixed(2)}`} />
        </View>
      </View>

      {/* Insight Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightDescription}>{insight.description}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { color: '#737373', marginTop: 12 },
  noDataText: { color: '#737373', fontSize: 15 },
  priceSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  price: { fontSize: 32, fontWeight: '700', color: '#171717' },
  changeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  changeText: { fontSize: 15, fontWeight: '500' },
  positive: { color: '#16a34a' },
  negative: { color: '#dc2626' },
  symbolBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#525252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  companyName: { fontSize: 18, color: '#404040', marginTop: 8 },
  exchange: { fontSize: 13, color: '#a3a3a3', marginTop: 4 },
  watchlistButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#171717',
    alignItems: 'center',
  },
  watchlistButtonActive: {
    backgroundColor: '#171717',
  },
  watchlistButtonText: { fontSize: 15, fontWeight: '600', color: '#171717' },
  watchlistButtonTextActive: { color: '#fff' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#171717', marginBottom: 12 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 10,
    width: '48%',
    flexGrow: 1,
  },
  statLabel: { fontSize: 12, color: '#737373', marginBottom: 4 },
  statValue: { fontSize: 15, color: '#171717', fontWeight: '500' },
  insightCard: {
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#171717',
  },
  insightTitle: { fontSize: 15, fontWeight: '600', color: '#171717', marginBottom: 8 },
  insightDescription: { fontSize: 14, color: '#525252', lineHeight: 20 },
});
