/**
 * Navigation route param types for type-safe navigation.
 */

export type RootStackParamList = {
  SearchMain: undefined;
  WatchlistMain: undefined;
  StockDetail: { symbol: string };
};

export type RootTabParamList = {
  Search: undefined;
  Watchlist: undefined;
};
