"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { Coins, Tag, Hash, Wallet, ArrowRight } from "lucide-react";
import { useDeployToken } from "../hooks/useDeployToken";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CreateTokenForm() {
  const { isConnected } = useAccount();
  const { deployToken, isDeploying, isMined, reset } = useDeployToken();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    decimals: "18", // Defaulting to standard 18 decimals
    initialSupply: "",
  });

  // Basic client-side validation
  const isFormValid = 
    formData.name.trim().length > 0 &&
    formData.symbol.trim().length > 0 &&
    Number(formData.decimals) > 0 &&
    Number(formData.decimals) <= 18 &&
    Number(formData.initialSupply) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    await deployToken({
      name: formData.name,
      symbol: formData.symbol,
      decimals: Number(formData.decimals),
      initialSupply: formData.initialSupply,
    });
  };

  const handleReset = () => {
    setFormData({ name: "", symbol: "", decimals: "18", initialSupply: "" });
    reset(); // Reset wagmi hook state
  };

  // If transaction is successful, show a success state instead of the form
  if (isMined) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="max-w-lg mx-auto border-success/30 bg-success/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
              <Coins className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl text-success">Token Deployed!</CardTitle>
            <CardDescription>
              Your new ERC20 token has been successfully created on the blockchain.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={handleReset} variant="outline">Create Another</Button>
            <Button variant="default" onClick={() => window.location.href = '/tokens'}>
              View My Tokens <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Deploy New Token</CardTitle>
          <CardDescription>
            Enter your token parameters below. The contract will be deployed via our secure factory.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted ml-1">Token Name</label>
              <Input
                placeholder="e.g. Bitcoin"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                icon={<Coins className="h-5 w-5" />}
                disabled={isDeploying}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted ml-1">Token Symbol</label>
              <Input
                placeholder="e.g. BTC"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                icon={<Tag className="h-5 w-5" />}
                disabled={isDeploying}
                maxLength={8}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Initial Supply</label>
                <Input
                  type="number"
                  placeholder="1000000"
                  min="1"
                  step="any"
                  value={formData.initialSupply}
                  onChange={(e) => setFormData({ ...formData, initialSupply: e.target.value })}
                  icon={<Wallet className="h-5 w-5" />}
                  disabled={isDeploying}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted ml-1">Decimals</label>
                <Input
                  type="number"
                  placeholder="18"
                  min="1"
                  max="18"
                  value={formData.decimals}
                  onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
                  icon={<Hash className="h-5 w-5" />}
                  disabled={isDeploying}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter>
            {!isConnected ? (
              <Button type="button" variant="secondary" className="w-full" disabled>
                Connect Wallet to Deploy
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="w-full" 
                isLoading={isDeploying}
                disabled={!isFormValid || isDeploying}
              >
                {isDeploying ? "Deploying Token..." : "Deploy Token"}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}