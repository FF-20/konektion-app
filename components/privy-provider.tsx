"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { useTheme } from "next-themes";

import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { sepolia } from "viem/chains";

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
          // logo: 'https://your-logo-url/',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain:sepolia,
        supportedChains:[sepolia]
      }}
    >
      <SmartWalletsProvider
          config={{
            paymasterContext: {
              mode: "SPONSORED",
              calculateGasLimits: true,
              expiryDuration: 300,
              sponsorshipInfo: {
                webhookData: {},
                smartAccountInfo: {
                  name: "BICONOMY",
                  version: "2.0.0",
                },
              },
            }
          }}
      >{children}</SmartWalletsProvider>
    </PrivyProvider>
  );
}