import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "@/providers/Web3Provider";
import { Navbar } from "@/components/layout/Navbar";
import { NetworkIndicator } from "@/components/web3/NetworkIndicator";
import "./globals.css";

// 1. Configure Primary Sans Font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// 2. Configure Monospace Font for Token Addresses/Hashes
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TacLaunchpad | Decentralized Token Creator",
  description: "A premium DeFi protocol for creating and managing ERC20 tokens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary relative pb-20">
        <Web3Provider>
          {/* Global Navigation */}
          <Navbar />
          
          {/* Main Page Content */}
          <main className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
            {children}
          </main>

          {/* Network Indicator (Floating Bottom Left) */}
          <div className="fixed bottom-6 left-6 z-40 hidden sm:block">
            <NetworkIndicator />
          </div>

          {/* Global Transaction Toasts matching our dark theme */}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--surface)',
                color: 'var(--foreground)',
                border: '1px solid var(--surface-border)',
                backdropFilter: 'blur(12px)',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#18181b' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#18181b' },
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}