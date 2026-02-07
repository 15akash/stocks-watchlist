/**
 * Integration test: SearchScreen
 * Tests that the screen renders correctly with mocked network responses.
 * Verifies: initial state, loading → data, loading → error → retry.
 */
import React from 'react';
import { create, act, ReactTestRenderer, ReactTestInstance } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchScreen } from '../src/screens/SearchScreen';
import { fmpClient } from '../src/api/fmpClient';

// Mock the API client module
jest.mock('../src/api/fmpClient', () => ({
  fmpClient: {
    searchSymbol: jest.fn(),
    getQuote: jest.fn(),
    getBatchQuotes: jest.fn().mockResolvedValue([]),
  },
}));

const mockSearchSymbol = fmpClient.searchSymbol as jest.MockedFunction<
  typeof fmpClient.searchSymbol
>;

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

function renderWithProviders(ui: React.ReactElement): ReactTestRenderer {
  const queryClient = createTestQueryClient();
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      React.createElement(QueryClientProvider, { client: queryClient }, ui),
    );
  });
  return renderer;
}

function findAllByType(root: ReactTestInstance, type: string): ReactTestInstance[] {
  return root.findAll((node) => node.type === type);
}

function findAllWithText(root: ReactTestInstance, text: string): ReactTestInstance[] {
  return root.findAll((node) => {
    if (node.children && node.children.length === 1 && typeof node.children[0] === 'string') {
      return node.children[0].includes(text);
    }
    return false;
  });
}

/** Wait for a condition to become true, polling every interval ms */
async function waitFor(
  fn: () => boolean,
  { timeout = 3000, interval = 50 }: { timeout?: number; interval?: number } = {},
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (fn()) return;
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, interval));
    });
  }
  throw new Error('waitFor timed out');
}

describe('SearchScreen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and initial empty state', () => {
    const renderer = renderWithProviders(React.createElement(SearchScreen));
    const root = renderer.root;

    const textInputs = findAllByType(root, 'TextInput');
    expect(textInputs.length).toBeGreaterThan(0);
    expect(textInputs[0].props.placeholder).toBe('Search stocks, companies...');

    const promptTexts = findAllWithText(root, 'Search for stocks');
    expect(promptTexts.length).toBeGreaterThan(0);
  });

  it('displays search results after debounced query', async () => {
    mockSearchSymbol.mockResolvedValue([
      { symbol: 'AAPL', name: 'Apple Inc.', currency: 'USD', exchangeShortName: 'NASDAQ' },
    ]);

    const renderer = renderWithProviders(React.createElement(SearchScreen));
    const root = renderer.root;
    const textInput = findAllByType(root, 'TextInput')[0];

    // Simulate typing
    await act(async () => {
      textInput.props.onChangeText('AAPL');
    });

    // Wait for debounce + query to resolve
    await waitFor(() => findAllWithText(root, 'Apple Inc.').length > 0);

    expect(mockSearchSymbol).toHaveBeenCalled();
    const appleTexts = findAllWithText(root, 'Apple Inc.');
    expect(appleTexts.length).toBeGreaterThan(0);
  }, 10000);

  it('shows error message with retry when API fails', async () => {
    mockSearchSymbol.mockRejectedValue(new Error('Network error'));

    const renderer = renderWithProviders(React.createElement(SearchScreen));
    const root = renderer.root;
    const textInput = findAllByType(root, 'TextInput')[0];

    await act(async () => {
      textInput.props.onChangeText('FAIL');
    });

    // Wait for debounce + error to propagate
    await waitFor(() => findAllWithText(root, 'Failed to search').length > 0);

    const errorTexts = findAllWithText(root, 'Failed to search');
    expect(errorTexts.length).toBeGreaterThan(0);

    const retryTexts = findAllWithText(root, 'Retry');
    expect(retryTexts.length).toBeGreaterThan(0);
  }, 10000);
});
