"use client";

import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits } from "viem";
import toast from "react-hot-toast";
import { TOKEN_FACTORY_ABI } from "@/lib/web3/abi/TokenFactory";

interface DeployTokenParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
}

export function useDeployToken() {
  const factoryAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS as `0x${string}`;
  const { address: userAddress } = useAccount();

  // 1. Setup Wagmi write contract hook
  const {
    writeContract,
    data: txHash,
    isPending: isConfirmingInWallet,
    error: writeError,
    reset,
  } = useWriteContract();

  // 2. Setup Wagmi wait for receipt hook (tracks actual block mining)
  const {
    isLoading: isMining,
    isSuccess: isMined,
    isError: isMiningError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // 3. Execution function exposed to the UI
  const deployToken = async (params: DeployTokenParams) => {
    if (!factoryAddress) {
      toast.error("Factory address not configured.");
      return;
    }

    if (!userAddress) {
      toast.error("Please connect your wallet first.");
      return;
    }

    try {
      // Parse supply based on provided decimals (e.g., "1000" with 18 decimals -> 1000 * 10^18)
      const formattedSupply = parseUnits(params.initialSupply, params.decimals);

      writeContract({
        address: factoryAddress,
        abi: TOKEN_FACTORY_ABI,
        functionName: "createToken",
        args: [
          params.name,
          params.symbol,
          params.decimals,
          formattedSupply,
          userAddress, // The owner of the token is the connected wallet
        ],
      });
    } catch (err) {
      console.error("Deploy Token Error:", err);
      toast.error("Failed to format transaction data.");
    }
  };

  // 4. Handle global toast notifications for the transaction lifecycle
  useEffect(() => {
    if (isConfirmingInWallet) {
      toast.loading("Confirming in wallet...", { id: "deploy-tx" });
    } else if (isMining) {
      toast.loading("Transaction submitted. Mining...", { id: "deploy-tx" });
    } else if (isMined) {
      toast.success("Token successfully deployed!", { id: "deploy-tx" });
    } else if (writeError || isMiningError) {
      const errorMsg = writeError?.message || "Transaction failed.";
      const displayError = errorMsg.includes("User rejected") 
        ? "Transaction rejected by user." 
        : "Failed to deploy token.";
        
      toast.error(displayError, { id: "deploy-tx" });
    }
  }, [isConfirmingInWallet, isMining, isMined, writeError, isMiningError]);

  return {
    deployToken,
    isDeploying: isConfirmingInWallet || isMining,
    isMined,
    txHash,
    receipt,
    reset,
  };
}