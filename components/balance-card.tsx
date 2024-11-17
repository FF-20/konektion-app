import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const BalanceCard = () => {
    const { ready, user } = usePrivy();
    const [smartWalletBalance, setSmartWalletBalance] = useState<
        string | undefined
    >(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getProvider = () => {
        return new ethers.providers.EtherscanProvider(
            "sepolia",
            process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
        );
    };

    const updateBalance = async () => {
        if (!ready || !user?.smartWallet?.address) {
            console.log("Skipping balance update - prerequisites not met");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const provider = getProvider();
            const swBalanceInWei = await provider.getBalance(
                user.smartWallet.address
            );
            const swBalanceInEth = ethers.utils.formatEther(swBalanceInWei);
            setSmartWalletBalance(swBalanceInEth);
        } catch (error) {
            console.error("Error fetching balance:", error);
            setError(
                `Failed to fetch balance: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            setIsLoading(false);
        }
    };

    const FormSchema = z.object({
        receiver: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
            message: "Receiver address must be a valid Ethereum address",
        }),
        //amount should be less than or equal to the balance
        amount: z.string().refine(
            (val) => {
                if (!smartWalletBalance) return false;
                return Number(val) <= Number(smartWalletBalance);
            },
            {
                message: "Insufficient balance",
            }
        ),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            // amount: "0.0001",
        },
    });

    useEffect(() => {
        if (ready && user?.smartWallet?.address) {
            updateBalance();
        }
    }, [ready, user?.smartWallet?.address]);

    return (
        <>
            <div className="relative w-full max-w-md mx-auto">
                <div className="absolute rounded-lg inset-0 bg-gradient-to-r via-violet-500 from-violet-400 to-indigo-700 pointer-events-none"></div>
                <Card className="relative bg-transparent w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex justify-center items-center text-center">
                            <p>Wallet Balance</p>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="text-center">
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 rounded-full animate-pulse bg-gray-400" />
                                        <div className="w-4 h-4 rounded-full animate-pulse bg-gray-400" />
                                        <div className="w-4 h-4 rounded-full animate-pulse bg-gray-400" />
                                    </div>
                                ) : (
                                    <p className="text-4xl font-bold">
                                        {smartWalletBalance
                                            ? `${Number(
                                                  smartWalletBalance
                                              ).toFixed(4)} ETH`
                                            : "0 ETH"}
                                    </p>
                                )}
                            </div>
                            {user?.smartWallet?.address && (
                                <div className="text-center">
                                    <span className="text-xs break-all">
                                        {user.smartWallet.address}
                                    </span>
                                </div>
                            )}
                            <Button
                                type="button"
                                onClick={updateBalance}
                                disabled={
                                    isLoading || !user?.smartWallet?.address
                                }
                                className="w-full"
                            >
                                {isLoading
                                    ? "Refreshing..."
                                    : "Refresh Balance"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="absolute bottom-0 left-0 w-[10%] h-[50%]  bg-indigo-800 blur-[154.2px]"></div>
            <div className="absolute top-0 right-0 w-[10%] h-[50%]  bg-violet-500 blur-[154.2px]"></div>
        </>
    );
};

export default BalanceCard;
