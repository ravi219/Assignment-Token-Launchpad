import Link from "next/link";
import { ArrowRight, Coins, Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-6xl">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-primary">TacLaunchpad</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-text-muted">
          Your premium gateway for creating, managing, and launching ERC20 tokens natively on the Sepolia network.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <Link href="/create" className="group">
          <Card className="h-full transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-glow">
            <CardHeader>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Rocket className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl">Launch a Token</CardTitle>
              <CardDescription className="mt-2 text-base">
                Deploy a brand new custom ERC20 token instantly with our secure, upgradeable factory contract.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-primary font-medium">
                Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/tokens" className="group">
          <Card className="h-full transition-all duration-300 hover:scale-105 hover:border-accent-cyan/50 hover:shadow-glow">
            <CardHeader>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-cyan/10 text-accent-cyan group-hover:bg-accent-cyan group-hover:text-white transition-colors">
                <Coins className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl">Manage Tokens</CardTitle>
              <CardDescription className="mt-2 text-base">
                View your token portfolio, analyze real-time balances, and execute on-chain transfers effortlessly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-accent-cyan font-medium">
                View Portfolio <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
