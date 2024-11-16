/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { useTheme } from "next-themes";
import { defineChain, http } from "viem";

import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { base, sepolia, baseSepolia, scrollSepolia } from "viem/chains";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";

import { OnchainKitProvider } from "@coinbase/onchainkit";

export default function PrivyProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const scrollSepolia = defineChain({
    id: 534351, // Replace this with your chain's ID
    name: "Scroll Sepolia",
    network: "scroll-sepolia",
    nativeCurrency: {
      decimals: 18, // Replace this with the number of decimals for your chain's native token
      name: "Ethereum",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: ["https://sepolia-rpc.scroll.io"],
      },
    },
    blockExplorers: {
      default: { name: "Explorer", url: "https://sepolia.scrollscan.com" },
    },
  });

  const baseSepolias = defineChain({
    id: 84532, // Replace this with your chain's ID
    name: "Base Sepolia",
    network: "base-sepolia",
    nativeCurrency: {
      decimals: 18, // Replace this with the number of decimals for your chain's native token
      name: "Ethereum",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: ["https://sepolia.base.org"],
      },
    },
    blockExplorers: {
      default: { name: "Explorer", url: "https://sepolia.basescan.com" },
    },
  });

  console.log(scrollSepolia);
  console.log(sepolia);

  const wagmiConfig = createConfig({
    chains: [sepolia, scrollSepolia],
    transports: {
      [sepolia.id]: http("https://rpc.sepolia.org"),
      [scrollSepolia.id]: http("https://sepolia-rpc.scroll.io"),
    },
  });

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: theme === "dark" ? "dark" : "light",
          accentColor: "#676FFF",
          // logo: 'https://your-logo-url',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain: baseSepolias,
        supportedChains: [sepolia, baseSepolias],
      }}
    >
      <SmartWalletsProvider
        // config={{
        //   paymasterContext: {
        //     mode: "SPONSORED",
        //     calculateGasLimits: true,
        //     expiryDuration: 300,
        //     sponsorshipInfo: {
        //       webhookData: {},
        //       smartAccountInfo: {
        //         name: "BICONOMY",
        //         version: "2.0.0",
        //       },
        //     },
        //   },
        // }}
      >
        <OnchainKitProvider apiKey="oIivHYJeI70CgGdccASaEfX8E6eXj8IU" chain={baseSepolia}>
          {children}
        </OnchainKitProvider>
        {/* <WagmiProvider config={wagmiConfig} reconnectOnMount={false}> */}
        {/* </WagmiProvider> */}
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}
