import { Metadata } from "next";
import { CreateTokenForm } from "@/features/token-creation/components/CreateTokenForm";

export const metadata: Metadata = {
  title: "Create Token | Launchpad Pro",
  description: "Deploy your own ERC20 token seamlessly.",
};

export default function CreateTokenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Launch Your Token
        </h1>
        <p className="text-lg text-text-muted">
          Instantly create and deploy your custom ERC20 token to the blockchain with no coding required.
        </p>
      </div>
      
      <div className="w-full">
        <CreateTokenForm />
      </div>
    </div>
  );
}