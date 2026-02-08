import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSearchStocks } from '../hooks/useSearchStocks';
import { useWatchlist } from '../hooks/useWatchlist';
import { ErrorRetry } from '../components/ErrorRetry';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { SearchResult } from '../models/types';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { query, setQuery, results, isLoading, isError, refetch, hasSearched, clearSearch } =
    useSearchStocks();
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  const handleAddToWatchlist = (item: SearchResult) => {
    if (isInWatchlist(item.symbol)) {
      Alert.alert('Already added', `${item.symbol} is already in your watchlist.`);
      return;
    }
    addToWatchlist(item.symbol, item.name);
    Alert.alert('Added', `${item.symbol} added to watchlist.`);
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol })}
      activeOpacity={0.7}
    >
      <View style={styles.resultLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.symbol.slice(0, 4)}</Text>
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.resultName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.resultSymbol}>
            {item.symbol} {item.exchange ? `· ${item.exchange}` : ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.addButton, isInWatchlist(item.symbol) && styles.addedButton]}
        onPress={() => handleAddToWatchlist(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.addButtonText, isInWatchlist(item.symbol) && styles.addedButtonText]}>
          {isInWatchlist(item.symbol) ? '✓' : '+'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Search stocks, companies..."
            placeholderTextColor={colors.textPlaceholder}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {isError && <ErrorRetry message="Failed to search stocks. Please try again." onRetry={refetch} />}

      {!isLoading && !isError && hasSearched && results.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>Try a different search term</Text>
        </View>
      )}

      {!isLoading && !isError && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.symbol}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {!hasSearched && !isLoading && (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Search for stocks</Text>
          <Text style={styles.emptySubtitle}>
            Type a company name or ticker symbol to get started
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  searchContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: colors.backgroundSubtle,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: typography.body,
  clearButton: { padding: 4 },
  clearText: { fontSize: 16, color: colors.textPlaceholder },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resultLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: typography.badgeSmall,
  resultInfo: { flex: 1 },
  resultName: typography.bodyMedium,
  resultSymbol: { ...typography.caption, marginTop: 2 },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addedButton: { backgroundColor: colors.border },
  addButtonText: { ...typography.headingMedium, color: colors.white },
  addedButtonText: { color: colors.textSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { ...typography.bodySmall, color: colors.textMuted, marginTop: 12 },
  emptyTitle: { ...typography.headingSmall, marginBottom: 8 },
  emptySubtitle: { ...typography.subtitle, textAlign: 'center' },
});
