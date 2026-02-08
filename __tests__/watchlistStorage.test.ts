import AsyncStorage from '@react-native-async-storage/async-storage';
import { watchlistStorage } from '../src/storage/watchlistStorage';

interface MockAsyncStorage {
  __resetStore: () => void;
  __getStore: () => Record<string, string>;
}

const mockAsyncStorage = AsyncStorage as unknown as typeof AsyncStorage & MockAsyncStorage;

beforeEach(() => {
  mockAsyncStorage.__resetStore();
  jest.clearAllMocks();
});

describe('watchlistStorage', () => {
  describe('getAll', () => {
    it('returns empty array when no data stored', async () => {
      const items = await watchlistStorage.getAll();
      expect(items).toEqual([]);
    });

    it('returns stored items', async () => {
      const data = [{ symbol: 'AAPL', name: 'Apple Inc.', addedAt: 1000 }];
      await AsyncStorage.setItem('@stocks_watchlist', JSON.stringify(data));

      const items = await watchlistStorage.getAll();
      expect(items).toEqual(data);
    });

    it('handles corrupt JSON gracefully', async () => {
      await AsyncStorage.setItem('@stocks_watchlist', 'not-json');
      const items = await watchlistStorage.getAll();
      expect(items).toEqual([]);
    });
  });

  describe('addItem', () => {
    it('adds a new item to empty watchlist', async () => {
      const items = await watchlistStorage.addItem('AAPL', 'Apple Inc.');
      expect(items).toHaveLength(1);
      expect(items[0].symbol).toBe('AAPL');
      expect(items[0].name).toBe('Apple Inc.');
      expect(items[0].addedAt).toBeGreaterThan(0);
    });

    it('avoids duplicates', async () => {
      await watchlistStorage.addItem('AAPL', 'Apple Inc.');
      const items = await watchlistStorage.addItem('AAPL', 'Apple Inc.');
      expect(items).toHaveLength(1);
    });

    it('persists to AsyncStorage', async () => {
      await watchlistStorage.addItem('TSLA', 'Tesla');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@stocks_watchlist',
        expect.stringContaining('TSLA'),
      );
    });
  });

  describe('removeItem', () => {
    it('removes an existing item', async () => {
      await watchlistStorage.addItem('AAPL', 'Apple');
      await watchlistStorage.addItem('TSLA', 'Tesla');
      const items = await watchlistStorage.removeItem('AAPL');
      expect(items).toHaveLength(1);
      expect(items[0].symbol).toBe('TSLA');
    });

    it('handles removing non-existent item', async () => {
      await watchlistStorage.addItem('AAPL', 'Apple');
      const items = await watchlistStorage.removeItem('GOOGL');
      expect(items).toHaveLength(1);
    });
  });

  describe('hasItem', () => {
    it('returns true for existing item', async () => {
      await watchlistStorage.addItem('AAPL', 'Apple');
      expect(await watchlistStorage.hasItem('AAPL')).toBe(true);
    });

    it('returns false for non-existing item', async () => {
      expect(await watchlistStorage.hasItem('AAPL')).toBe(false);
    });
  });
});
