# Stocks Watchlist

A React Native (Expo) app that lets users search equities, save them to a persistent watchlist, and view detailed stock quotes with insights.

## Prerequisites

- Node.js >= 18
- npm or yarn
- Expo CLI (`npx expo`)
- iOS Simulator (macOS) or Android Emulator, or Expo Go on a physical device
- A free API key from [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs)

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd stocks-watchlist

# 2. Install dependencies
npm install

# 3. Set up your API key
cp .env.example .env
# Edit .env and replace your_api_key_here with your FMP API key

# 4. Start the app
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## API Key Configuration

The FMP API key is loaded from the `FMP_API_KEY` environment variable via `app.config.ts` into `expo-constants`. This keeps the key out of source code. The app reads it at runtime through `Constants.expoConfig.extra.fmpApiKey`.

## Architecture

```
src/
  api/            # FMP API client (fetch wrapper with timeout, error handling)
  domain/         # Mappers: API response -> domain models
  models/         # TypeScript interfaces for domain entities
  storage/        # AsyncStorage persistence for watchlist
  hooks/          # React Query hooks for search, quotes, watchlist
  screens/        # SearchScreen, WatchlistScreen, StockDetailScreen
  components/     # Reusable UI components (StockCard, ErrorRetry)
  navigation/     # Tab + Stack navigation with typed params
```

### Key Decisions

| Concern | Choice | Why |
|---------|--------|-----|
| **Data fetching** | TanStack React Query | Built-in caching, retry with exponential backoff, stale-while-revalidate, request cancellation. Cleanly separates server cache from UI state. |
| **Persistence** | AsyncStorage | Simple key-value store that persists across restarts. Suitable for a flat list of watchlist symbols. |
| **Navigation** | React Navigation (bottom tabs + native stack) | Standard React Native navigation with type-safe param lists. |
| **API layer** | Custom fetch client | Lightweight, no extra dependency. Includes timeout (10s), error normalization, and FMP error message extraction. |
| **Separation of concerns** | api/ -> domain/ -> hooks/ -> screens/ | Raw API types stay in `api/`, domain mappers transform them, hooks manage state, screens are pure UI. |
| **Offline-first** | React Query gcTime + stale labels | Cached quotes remain usable when offline. Stale data is clearly labeled. Watchlist persists locally regardless of network. |

### Reliability

- **Retry with backoff**: React Query retries failed requests twice with exponential backoff (1s, 2s).
- **Request cancellation**: Search debounces input (400ms) and cancels in-flight requests when a new query is typed.
- **Partial failure handling**: Batch quotes can return partial data; the watchlist screen shows available quotes and marks missing ones as stale.
- **Consistent errors**: All API errors are normalized to `FMPClientError` with a message and optional status code. The `ErrorRetry` component provides a unified retry UX.

## Running Tests

```bash
npm test
```

**Test suite summary (20 tests):**

- `mappers.test.ts` - Unit tests for API-to-domain mapping (null safety, field defaults, array handling)
- `watchlistStorage.test.ts` - Unit tests for AsyncStorage persistence (CRUD, duplicate prevention, corrupt data recovery)
- `SearchScreen.test.tsx` - Integration test: renders screen with mocked API, verifies initial state -> loading -> results/error -> retry flow

## Product Judgment Answers

**Q: What trade-offs did you make?**
- Prioritized correctness and architecture over visual polish. The UI follows the wireframe layout but uses simple text icons instead of vector icon libraries to minimize dependencies.
- Chose React Query over a custom caching solution for its mature retry/stale/offline behavior.

**Q: What would you do with one extra day?**
- Add a price chart using `react-native-svg` or `victory-native` on the Stock Detail screen.
- Implement swipe-to-delete on watchlist items.
- Add offline detection with `@react-native-community/netinfo` and show a banner when offline.
- Add E2E tests with Detox or Maestro.
- Improve the Insights section with more computed metrics (RSI approximation, moving average crossover signals).

## Time Spent

~5 hours total:
- Architecture planning + API research: 30 min
- Core layers (API client, models, mappers, storage): 45 min
- Hooks + React Query integration: 45 min
- Three screens + navigation: 1.5 hours
- Testing setup + writing tests: 1 hour
- Type safety, cleanup, README: 30 min

## Known Limitations

- No chart visualization on the Stock Detail screen (placeholder only).
- No explicit offline detection banner (relies on React Query cache + stale labels).
- FMP free tier has rate limits; heavy usage may hit 429 errors.
- Search filters (Trending, Tech, etc.) are visual placeholders from the wireframe and not yet functional.
