"use client";

import { useState } from "react";
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { Copy, ExternalLink, Send, ArrowLeft, Coins, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { ERC20_ABI } from "@/lib/web3/abi/ERC20";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

interface TokenDetailsProps {
  tokenAddress: `0x${string}`;
}

// We extend our basic ERC20 ABI to include the transfer function for interactions
const ERC20_INTERACTION_ABI = [
  ...ERC20_ABI,
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export function TokenDetails({ tokenAddress }: TokenDetailsProps) {
  const { address: userAddress } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  // 1. Fetch Real-Time Token Data
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { address: tokenAddress, abi: ERC20_ABI, functionName: "name" },
      { address: tokenAddress, abi: ERC20_ABI, functionName: "symbol" },
      { address: tokenAddress, abi: ERC20_ABI, functionName: "decimals" },
      { address: tokenAddress, abi: ERC20_ABI, functionName: "totalSupply" },
      { address: tokenAddress, abi: ERC20_ABI, functionName: "balanceOf", args: [userAddress!] },
    ],
    query: {
      enabled: !!userAddress,
    }
  });

  // 2. Setup Transfer Interaction
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decimals) return;
    
    try {
      const formattedAmount = parseUnits(amount, decimals);
      writeContract({
        address: tokenAddress,
        abi: ERC20_INTERACTION_ABI,
        functionName: "transfer",
        args: [recipient as `0x${string}`, formattedAmount],
      });
    } catch (error) {
      toast.error("Invalid amount or address");
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const name = data[0].result as string;
  const symbol = data[1].result as string;
  const decimals = data[2].result as number;
  const totalSupply = formatUnits((data[3].result as bigint) || 0n, decimals);
  const balance = formatUnits((data[4].result as bigint) || 0n, decimals);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/tokens" className="inline-flex items-center text-text-muted hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Tokens
      </Link>

      {/* Overview Card */}
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Coins className="h-8 w-8 text-primary" /> {name}
            </CardTitle>
            <p className="text-xl font-mono text-text-muted mt-2">{symbol}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" onClick={() => {
              navigator.clipboard.writeText(tokenAddress);
              toast.success("Address copied!");
            }}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => window.open(`https://sepolia.etherscan.io/address/${tokenAddress}`, '_blank')}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6 bg-surface-hover/30 p-4 rounded-xl border border-surface-border">
            <div>
              <p className="text-sm text-text-muted mb-1 uppercase tracking-wider">Total Supply</p>
              <p className="text-2xl font-semibold">{totalSupply}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1 uppercase tracking-wider">Your Balance</p>
              <p className="text-2xl font-semibold text-primary">{balance}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Card: Transfer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" /> Transfer Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-text-muted">Recipient Address</label>
              <Input 
                placeholder="0x..." 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                disabled={isPending || isMining}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-muted">Amount ({symbol})</label>
              <Input 
                type="number"
                placeholder="0.0"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isPending || isMining}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending || isMining || !recipient || !amount}
            >
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...</> : 
               isMining ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mining...</> : 
               "Send Tokens"}
            </Button>
            {isSuccess && (
              <p className="text-success text-sm text-center mt-2 animate-fade-in">
                Transfer successful!
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}