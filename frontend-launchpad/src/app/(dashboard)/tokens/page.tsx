import { Metadata } from "next";
import { TokenList } from "@/features/token-management/components/TokenList";

export const metadata: Metadata = {
  title: "My Tokens | Launchpad Pro",
  description: "View and manage your deployed ERC20 tokens.",
};

export default function TokensDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Tokens</h1>
        <p className="text-text-muted">
          Manage and track all the ERC20 tokens you have deployed through the platform.
        </p>
      </div>
      
      <div className="w-full">
        <TokenList />
      </div>
    </div>
  );
}