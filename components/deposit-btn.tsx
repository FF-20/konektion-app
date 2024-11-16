"use client";
import React from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import OnrampModal from "./onramp-dialog";

const DepositBtn = () => {
    const { ready, authenticated, user } = usePrivy();
    const { theme } = useTheme();
    const [onrampUrl, setOnrampUrl] = React.useState<string | null>(null);

    const fundWallet = async () => {
        if (!ready || !authenticated || !user?.wallet?.address) {
            console.error("Unable to fund wallet.");
            return;
        }

        const walletAddress = user.wallet.address;
        const emailAddress = user.email?.address;
        const redirectUrl = window.location.href;
        const authToken = await getAccessToken();

        try {
            const onrampResponse = await fetch("/api/onramp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    address: walletAddress,
                    email: emailAddress,
                    redirectUrl: redirectUrl,
                    theme: theme,
                    authToken: authToken,
                }),
            });

            if (!onrampResponse.ok) {
                console.error("Failed to fetch onramp URL:", onrampResponse);
                return;
            }

            const data = await onrampResponse.json();

            setOnrampUrl(data.url);
        } catch (error) {
            console.error("Error in funding wallet:", error);
        }
    };

    return (
        <>
            <OnrampModal
                onrampUrl={onrampUrl}
                onClose={() => setOnrampUrl(null)}
            />
            <Button
                className="w-full"
                onClick={() => {
                    fundWallet();
                }}
            >
                Reload Wallet
            </Button>
        </>
    );
};

export default DepositBtn;
