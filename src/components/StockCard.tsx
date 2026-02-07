import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  changesPercentage?: number;
  onPress: () => void;
  stale?: boolean;
}

export function StockCard({ symbol, name, price, change, changesPercentage, onPress, stale }: Props) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText} numberOfLines={1}>
            {symbol.slice(0, 4)}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.symbol}>{symbol}</Text>
        </View>
      </View>
      <View style={styles.right}>
        {price != null ? (
          <>
            <Text style={styles.price}>${price.toFixed(2)}</Text>
            <Text style={[styles.change, isPositive ? styles.positive : styles.negative]}>
              {isPositive ? '+' : ''}
              {changesPercentage?.toFixed(2)}%
            </Text>
            {stale && <Text style={styles.staleLabel}>stale</Text>}
          </>
        ) : (
          <Text style={styles.noData}>--</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#525252',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  info: { flex: 1 },
  name: { fontSize: 15, color: '#171717', fontWeight: '500' },
  symbol: { fontSize: 13, color: '#737373', marginTop: 2 },
  right: { alignItems: 'flex-end', marginLeft: 12 },
  price: { fontSize: 15, color: '#171717', fontWeight: '500' },
  change: { fontSize: 13, marginTop: 2 },
  positive: { color: '#16a34a' },
  negative: { color: '#dc2626' },
  noData: { fontSize: 15, color: '#a3a3a3' },
  staleLabel: {
    fontSize: 10,
    color: '#f59e0b',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
