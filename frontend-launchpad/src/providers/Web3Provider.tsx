"use client";

import * as React from "react";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";

// 1. Import the optimized query client from our performance phase
import { optimizedQueryClient } from "@/lib/web3/queryClient";

// 2. Configure Wagmi & RainbowKit
// We strictly define the testnets required for this launchpad assignment[cite: 33].
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "DEMO_PROJECT_ID";

const config = getDefaultConfig({
  appName: "TacLaunchpad",
  projectId: projectId,
  chains: [sepolia],
  ssr: true, // Required for Next.js App Router
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      {/* 3. Inject our performance-tuned Query Client */}
      <QueryClientProvider client={optimizedQueryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "var(--primary)",
            accentColorForeground: "white",
            borderRadius: "large",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}