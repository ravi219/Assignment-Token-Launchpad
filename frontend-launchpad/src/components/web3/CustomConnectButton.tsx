"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { ChevronDown, Wallet } from "lucide-react";

export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} variant="default" className="shadow-glow">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="danger">
                    Wrong Network
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  {/* Network Switcher Button */}
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover border border-surface-border"
                  >
                    {chain.hasIcon && (
                      <div className="h-5 w-5 overflow-hidden rounded-full bg-background">
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="h-5 w-5"
                          />
                        )}
                      </div>
                    )}
                    <span className="hidden sm:block">{chain.name}</span>
                    <ChevronDown className="h-4 w-4 text-text-muted" />
                  </button>

                  {/* Account Button (Balance + Address) */}
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover border border-surface-border"
                  >
                    <span className="hidden sm:block text-text-muted pr-2 border-r border-surface-border">
                      {account.displayBalance
                        ? ` ${account.displayBalance}`
                        : ""}
                    </span>
                    <span className="pl-1 tracking-wide">{account.displayName}</span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}