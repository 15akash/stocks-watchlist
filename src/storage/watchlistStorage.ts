/**
 * Watchlist persistence via AsyncStorage.
 * Stores symbol + name + timestamp of when added.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WatchlistItem } from '../models/types';

const WATCHLIST_KEY = '@stocks_watchlist';

export const watchlistStorage = {
  async getAll(): Promise<WatchlistItem[]> {
    const raw = await AsyncStorage.getItem(WATCHLIST_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async save(items: WatchlistItem[]): Promise<void> {
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
  },

  async addItem(symbol: string, name: string): Promise<WatchlistItem[]> {
    const current = await this.getAll();
    if (current.some((item) => item.symbol === symbol)) {
      return current; // already exists, avoid duplicates
    }
    const updated = [...current, { symbol, name, addedAt: Date.now() }];
    await this.save(updated);
    return updated;
  },

  async removeItem(symbol: string): Promise<WatchlistItem[]> {
    const current = await this.getAll();
    const updated = current.filter((item) => item.symbol !== symbol);
    await this.save(updated);
    return updated;
  },

  async hasItem(symbol: string): Promise<boolean> {
    const current = await this.getAll();
    return current.some((item) => item.symbol === symbol);
  },
};
