"use client";
import React, {useState} from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import OnrampModal from "./onramp-dialog";
import { LoaderCircle } from "lucide-react"

const DepositBtn = () => {
    const { ready, authenticated, user } = usePrivy();
    const { theme } = useTheme();
    const [onrampUrl, setOnrampUrl] = React.useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fundWallet = async () => {
        if (!ready || !authenticated || !user?.smartWallet?.address) {
            console.error("Unable to fund wallet.");
            return;
        }

        const walletAddress = user.smartWallet.address;
        const emailAddress = user.email?.address;
        const redirectUrl = window.location.href;
        const authToken = await getAccessToken();
        setLoading(true); 
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <OnrampModal
                onrampUrl={onrampUrl}
                onClose={() => setOnrampUrl(null)}
            />
            <Button
                className="w-full bg-[#666eff] hover:bg-[#666eff]/90 py-3 px-6 text-white rounded-lg transition-colors z-20"
                onClick={() => {
                    fundWallet();
                }}
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <LoaderCircle className="animate-spin h-5 w-5 mr-2" />
                        Loading...
                    </div>
                ) : (
                    "Reload Wallet"
                )}
            </Button>
        </>
    );
};

export default DepositBtn;
