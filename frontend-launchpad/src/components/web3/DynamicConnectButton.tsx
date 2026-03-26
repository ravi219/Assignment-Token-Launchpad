"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Dynamically imported Connect Button.
 * Web3 modal libraries are notoriously heavy. By disabling SSR for this specific component
 * and loading it dynamically, we significantly reduce the First Load JS size and TTI (Time to Interactive).
 */
export const DynamicConnectButton = dynamic(
  () => import("./CustomConnectButton").then((mod) => mod.CustomConnectButton),
  {
    ssr: false,
    loading: () => <Skeleton className="h-11 w-[160px] rounded-xl" />,
  }
);