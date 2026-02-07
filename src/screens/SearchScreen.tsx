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
            {item.symbol} {item.exchangeShortName ? `· ${item.exchangeShortName}` : ''}
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
            placeholderTextColor="#a3a3a3"
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
          <ActivityIndicator size="large" color="#171717" />
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
  container: { flex: 1, backgroundColor: '#fff' },
  searchContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4d4d4',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#fafafa',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#171717' },
  clearButton: { padding: 4 },
  clearText: { fontSize: 16, color: '#a3a3a3' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  resultLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#525252',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 15, color: '#171717', fontWeight: '500' },
  resultSymbol: { fontSize: 13, color: '#737373', marginTop: 2 },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#171717',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addedButton: { backgroundColor: '#e5e5e5' },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  addedButtonText: { color: '#525252' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { color: '#737373', marginTop: 12, fontSize: 14 },
  emptyTitle: { fontSize: 17, color: '#171717', fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#a3a3a3', textAlign: 'center' },
});
