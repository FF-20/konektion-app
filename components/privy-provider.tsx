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
                defaultChain: sepolia,
                supportedChains: [sepolia, baseSepolia],
            }}
        >
            {/* <SmartWalletsProvider> */}
                {/* <OnchainKitProvider apiKey="oIivHYJeI70CgGdccASaEfX8E6eXj8IU" chain={baseSepolia}>*/}
                {children}
                {/*</OnchainKitProvider>*/}
                {/* <WagmiProvider config={wagmiConfig} reconnectOnMount={false}> */}
                {/* </WagmiProvider> */}
            {/* </SmartWalletsProvider> */}
        </PrivyProvider>
    );
}
