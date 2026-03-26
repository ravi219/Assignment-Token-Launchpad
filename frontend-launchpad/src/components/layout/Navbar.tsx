"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DynamicConnectButton } from "@/components/web3/DynamicConnectButton";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Create Token", href: "/create" },
    { name: "My Tokens", href: "/tokens" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-surface-border bg-background/60 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className="flex items-center gap-2 group transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Rocket className="h-5 w-5 text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Tac<span className="text-primary">Launchpad</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-surface text-foreground" 
                      : "text-text-muted hover:text-foreground hover:bg-surface-hover/50"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Wallet Connection & Transactions */}
        <div className="flex items-center gap-3">
          <DynamicConnectButton />
        </div>
        
      </div>
    </header>
  );
}