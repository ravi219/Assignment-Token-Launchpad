"use client";

import { motion } from "framer-motion";
import { Copy, ExternalLink, Coins, RefreshCw, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useUserTokens, TokenDetails } from "../hooks/useUserTokens";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export function TokenList() {
  const { tokens, isLoading, isConnected, refetchAll } = useUserTokens();

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Contract address copied!");
  };

  const getExplorerUrl = (address: string) => {
    // Defaulting to Sepolia explorer for the assignment context
    return `https://sepolia.etherscan.io/address/${address}`;
  };

  // 1. Disconnected State
  if (!isConnected) {
    return (
      <Card className="max-w-md mx-auto text-center p-8">
        <Coins className="mx-auto h-12 w-12 text-text-muted mb-4 opacity-50" />
        <CardTitle className="mb-2">Wallet Disconnected</CardTitle>
        <p className="text-text-muted text-sm">
          Please connect your wallet to view your deployed tokens.
        </p>
      </Card>
    );
  }

  // 2. Loading State (Skeletons)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-[220px]">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // 3. Empty State
  if (tokens.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="max-w-md mx-auto text-center p-8 border-dashed border-2 border-surface-border bg-transparent shadow-none">
          <Coins className="mx-auto h-12 w-12 text-primary mb-4 opacity-80" />
          <CardTitle className="mb-2">No Tokens Found</CardTitle>
          <p className="text-text-muted text-sm mb-6">
            You haven't deployed any tokens yet. Head over to the creation page to launch your first asset.
          </p>
          <Button onClick={() => window.location.href = '/create'}>
            Create Token
          </Button>
        </Card>
      </motion.div>
    );
  }

  // 4. Populated State (Staggered Grid)
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => refetchAll()} className="text-text-muted hover:text-foreground">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh List
        </Button>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        {tokens.map((token: TokenDetails) => (
          <motion.div
            key={token.address}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <Card className="h-full flex flex-col hover:border-primary/50 transition-colors group">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {token.name}
                    </CardTitle>
                    <p className="text-sm font-mono text-primary bg-primary/10 inline-block px-2 py-0.5 rounded mt-1">
                      {token.symbol}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-grow space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-surface-hover/50 p-3 rounded-lg">
                    <p className="text-text-muted mb-1 text-xs uppercase tracking-wider">Total Supply</p>
                    <p className="font-medium truncate">{token.totalSupply}</p>
                  </div>
                  <div className="bg-surface-hover/50 p-3 rounded-lg">
                    <p className="text-text-muted mb-1 text-xs uppercase tracking-wider">Your Balance</p>
                    <p className="font-medium truncate">{token.userBalance}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-background/50 p-2 rounded-lg border border-surface-border">
                  <span className="font-mono text-xs text-text-muted truncate w-24 sm:w-32">
                    {token.address}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleCopyAddress(token.address)}
                      className="p-1.5 hover:bg-surface-hover rounded text-text-muted hover:text-foreground transition-colors"
                      title="Copy Address"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <a 
                      href={getExplorerUrl(token.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-surface-hover rounded text-text-muted hover:text-foreground transition-colors"
                      title="View on Explorer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </CardContent>

              <div className="px-6 pb-6 pt-2">
                <Link href={`/tokens/${token.address}`} className="w-full block">
                  <Button variant="default" className="w-full group shadow-none">
                    Manage Token 
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}