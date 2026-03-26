"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { TOKEN_FACTORY_ABI } from "@/lib/web3/abi/TokenFactory";
import { ERC20_ABI } from "@/lib/web3/abi/ERC20";

export interface TokenDetails {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  userBalance: string;
}

export function useUserTokens() {
  const { address: userAddress, isConnected } = useAccount();
  const factoryAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS as `0x${string}`;

  // 1. Fetch the list of token addresses deployed by the user
  const { 
    data: tokenAddresses, 
    isLoading: isFetchingAddresses,
    refetch: refetchAddresses 
  } = useReadContract({
    address: factoryAddress,
    abi: TOKEN_FACTORY_ABI,
    functionName: "getUserTokens",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!factoryAddress,
    }
  });

  // 2. Construct the multicall configuration array for all tokens
  const multicallContracts = useMemo(() => {
    if (!tokenAddresses || tokenAddresses.length === 0) return [];

    return tokenAddresses.flatMap((tokenAddress) => [
      { address: tokenAddress as `0x${string}`, abi: ERC20_ABI, functionName: "name" },
      { address: tokenAddress as `0x${string}`, abi: ERC20_ABI, functionName: "symbol" },
      { address: tokenAddress as `0x${string}`, abi: ERC20_ABI, functionName: "decimals" },
      { address: tokenAddress as `0x${string}`, abi: ERC20_ABI, functionName: "totalSupply" },
      { address: tokenAddress as `0x${string}`, abi: ERC20_ABI, functionName: "balanceOf", args: [userAddress!] },
    ]);
  }, [tokenAddresses, userAddress]);

  // 3. Execute the multicall to fetch all metadata at once
  const { 
    data: multicallData, 
    isLoading: isFetchingMetadata,
    refetch: refetchMetadata 
  } = useReadContracts({
    contracts: multicallContracts,
    query: {
      enabled: multicallContracts.length > 0,
    }
  });

  // 4. Parse and format the raw blockchain data into a clean UI array
  const tokens: TokenDetails[] = useMemo(() => {
    if (!tokenAddresses || !multicallData) return [];

    const formattedTokens: TokenDetails[] = [];
    
    // Each token has 5 contract calls in the flat array
    const callsPerToken = 5; 

    tokenAddresses.forEach((address, index) => {
      const baseIndex = index * callsPerToken;
      
      const name = multicallData[baseIndex]?.result as string || "Unknown";
      const symbol = multicallData[baseIndex + 1]?.result as string || "???";
      const decimals = multicallData[baseIndex + 2]?.result as number || 18;
      const rawTotalSupply = multicallData[baseIndex + 3]?.result as bigint || BigInt(0);
      const rawBalance = multicallData[baseIndex + 4]?.result as bigint || BigInt(0);

      formattedTokens.push({
        address: address as `0x${string}`,
        name,
        symbol,
        decimals,
        totalSupply: formatUnits(rawTotalSupply, decimals),
        userBalance: formatUnits(rawBalance, decimals),
      });
    });

    return formattedTokens.reverse(); // Show newest tokens first
  }, [tokenAddresses, multicallData]);

  const refetchAll = async () => {
    await refetchAddresses();
    if (multicallContracts.length > 0) {
      await refetchMetadata();
    }
  };

  return {
    tokens,
    isLoading: isFetchingAddresses || isFetchingMetadata,
    isConnected,
    refetchAll,
  };
}