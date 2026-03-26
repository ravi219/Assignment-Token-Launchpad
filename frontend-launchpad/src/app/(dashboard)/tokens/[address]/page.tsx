import { Metadata } from "next";
import { TokenDetails } from "@/features/token-management/components/TokenDetails";

export const metadata: Metadata = {
  title: "Token Details | Launchpad Pro",
  description: "View and interact with your deployed smart contract.",
};

export default async function TokenDetailsPage({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = await params;
  // Ensure the address is strictly typed as a hex string for Wagmi/Viem compatibility
  const tokenAddress = resolvedParams.address as `0x${string}`;

  return (
    <div className="w-full">
      <TokenDetails tokenAddress={tokenAddress} />
    </div>
  );
}