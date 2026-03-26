import { QueryClient } from "@tanstack/react-query";

/**
 * Optimized Query Client for Web3 Applications.
 * * Standard REST API caching rules don't apply well to blockchains.
 * We set the staleTime to 12 seconds (approximate Ethereum block time).
 * This means if a user navigates between the Dashboard and Token Details 
 * within the same block window, we serve the cached data instantly without hitting the RPC.
 */
export const optimizedQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for one standard EVM block cycle
      staleTime: 12_000, 
      // Keep inactive data in memory for 1 hour to ensure snappy back-navigation
      gcTime: 1_000 * 60 * 60, 
      // Prevent spamming the RPC provider when the user alt-tabs back to the browser
      refetchOnWindowFocus: false,
      // Aggressive retry logic for flaky testnet RPC endpoints
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});