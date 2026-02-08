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

The FMP API key is loaded from the `FMP_API_KEY` environment variable via `app.config.ts` into `expo-constants`. The app reads it at runtime through `Constants.expoConfig.extra.fmpApiKey`.

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
  theme/          # Centralized colors and typography tokens
```

### Key Decisions

| Concern | Choice | Why |
|---------|--------|-----|
| **Data fetching** | TanStack React Query | Built-in caching, retry with exponential backoff, stale-while-revalidate, request cancellation. Cleanly separates server cache from UI state. |
| **Persistence** | AsyncStorage | Simple key-value store that persists across restarts. Suitable for a flat list of watchlist symbols. |
| **Navigation** | React Navigation (bottom tabs + native stack) | Standard React Native navigation with type-safe param lists. |
| **API layer** | Custom fetch client | Lightweight, no extra dependency. Includes timeout (10s), error normalization, and FMP error message extraction. Uses `/stable/profile` (free-tier compatible) with parallel fetches for batch quotes. |
| **Search** | Dual endpoint (symbol + name) | Searches both `/stable/search-symbol` and `/stable/search-name` in parallel, merges and deduplicates, so users can find stocks by either ticker or company name. |
| **Theme** | Centralized colors + typography | All colors in `theme/colors.ts`, all text styles in `theme/typography.ts`. No hardcoded hex values in components. |
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

**Test suite summary (21 tests):**

- `mappers.test.ts` - Unit tests for API-to-domain mapping (null safety, field defaults, range parsing, array handling)
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

## Known Limitations / TODOs

- No chart visualization on the Stock Detail screen.
- No explicit offline detection banner (relies on React Query cache + stale labels).
- FMP free tier has rate limits; heavy usage may hit 429 errors.
- FMP free tier does not provide `/stable/quote` or `/stable/batch-quote`; the app uses `/stable/profile` instead (fetches individually in parallel for batch operations).
- Some profile fields (P/E, EPS, day high/low, open, previous close) are not available on the free-tier profile endpoint.
- No swipe-to-delete on watchlist items (currently uses alert confirmation from detail screen).
- No push notifications for price alerts.
- No user authentication or cloud sync — watchlist is device-local only.

## App Store Deployment Strategy

### Pre-Submission
1. **App icons & splash screen**: Replace placeholder assets in `assets/` with production artwork (1024x1024 icon, adaptive icon for Android).
2. **Bundle identifier**: Set unique `ios.bundleIdentifier` and `android.package` in `app.config.ts`.
3. **Version management**: Bump `version` and platform-specific `buildNumber`/`versionCode` for each release.
4. **Environment**: Move API key to a production-grade secret manager (e.g., EAS Secrets) rather than a local `.env` file.

### Build & Distribution
- Use **EAS Build** (`eas build`) for both iOS and Android production builds.
- Configure **EAS Submit** (`eas submit`) for automated App Store Connect and Google Play Console uploads.
- Set up a CI pipeline (GitHub Actions) to run `npm test` + `npx tsc --noEmit` on every PR, and trigger EAS builds on `main` merges.

### iOS (App Store)
- Enroll in the Apple Developer Program ($99/year).
- Configure provisioning profiles and signing certificates via EAS (managed credentials).
- Submit via App Store Connect with required metadata: screenshots (6.7", 6.5", 5.5"), description, privacy policy URL, and app category (Finance).
- Expect 1-2 days for App Review.

### Android (Google Play)
- Enroll in Google Play Developer account ($25 one-time).
- EAS generates a signed AAB for upload.
- Submit via Google Play Console with store listing, screenshots, and content rating questionnaire.
- Use a staged rollout (e.g., 20% -> 100%) for the initial release.

### Post-Launch
- Use **EAS Update** for OTA JavaScript updates (bug fixes, UI changes) without going through app review.
- Monitor crash reports via Sentry or Expo's built-in error reporting.
- Track API usage and consider upgrading to a paid FMP tier if the user base grows.
