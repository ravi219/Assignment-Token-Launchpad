"use client";

import { useBlockNumber, useGasPrice, useChainId } from "wagmi";
import { formatGwei } from "viem";
import { Activity, Fuel } from "lucide-react";

export function NetworkIndicator() {
  const chainId = useChainId();
  
  // Fetch block number, updating automatically
  const { data: blockNumber } = useBlockNumber({ watch: true });
  
  // Fetch gas price, updating automatically
  const { data: gasPrice } = useGasPrice();

  // Determine network status dot color
  const isTestnet = chainId === 11155111 || chainId === 80002 || chainId === 97;

  return (
    <div className="flex items-center gap-4 text-xs font-mono text-text-muted bg-surface/50 border border-surface-border px-4 py-2 rounded-full backdrop-blur-md">
      {/* Network Status */}
      <div className="flex items-center gap-2" title={isTestnet ? "Testnet Active" : "Mainnet Active"}>
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTestnet ? 'bg-warning' : 'bg-success'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isTestnet ? 'bg-warning' : 'bg-success'}`}></span>
        </span>
        <span className="hidden sm:inline-block">Network Connected</span>
      </div>

      <div className="h-3 w-px bg-surface-border"></div>

      {/* Block Number */}
      <div className="flex items-center gap-1.5" title="Latest Block">
        <Activity className="h-3 w-3" />
        {blockNumber ? blockNumber.toString() : "---"}
      </div>

      <div className="h-3 w-px bg-surface-border"></div>

      {/* Gas Price */}
      <div className="flex items-center gap-1.5" title="Current Gas Price">
        <Fuel className="h-3 w-3" />
        {gasPrice ? (
          <span>{Number(formatGwei(gasPrice)).toFixed(2)} Gwei</span>
        ) : (
          <span>---</span>
        )}
      </div>
    </div>
  );
}