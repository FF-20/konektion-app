import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseEther, parseGwei } from "viem";
import { sepolia } from "viem/chains";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "./ui/input";

const BalanceCard = () => {
    const { ready, user } = usePrivy();
    const [balance, setBalance] = useState<string | undefined>(undefined);
    const [smartWalletBalance, setSmartWalletBalance] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [walletInitialized, setWalletInitialized] = useState(false);
    const [smartWalletInitialized, setSmartWalletInitialized] = useState(true);
    const { client: smartContractClient } = useSmartWallets();

    const getProvider = () => {
        return new ethers.providers.EtherscanProvider(
            "sepolia",
            process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
        );
    };

    const updateBalance = async () => {
        if (!ready || !user?.wallet?.address || !user?.smartWallet?.address) {
            console.log("Skipping balance update - prerequisites not met");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const provider = getProvider();
            if (user.wallet) {
                const balanceInWei = await provider.getBalance(
                    user.wallet.address
                );
                const balanceInEth = ethers.utils.formatEther(balanceInWei);
                // const smartWallet = user?.linkedAccounts.find((account) => account.type === "smart_wallet")
                console.log(user?.linkedAccounts);
                console.log(user);

                setBalance(balanceInEth);
                setWalletInitialized(true);
            }
            if (user.smartWallet) {
                const swBalanceInWei = await provider.getBalance(
                    user.smartWallet.address
                );
                const swBalanceInEth = ethers.utils.formatEther(swBalanceInWei);

                setSmartWalletBalance(swBalanceInEth);
                setSmartWalletInitialized(true);
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
            setError(
                `Failed to fetch balance: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
            setWalletInitialized(false);
        } finally {
            setIsLoading(false);
        }
    };

    const sendSmartWalletTransaction = async () => {
        if (!smartContractClient) return;
        console.log(smartContractClient.account);
        const txHash = await smartContractClient.sendTransaction({
            account: smartContractClient.account,
            chain: sepolia,
            to: "0xbc0b9bC6c967BA2e837F4D0069Ed2C2c8ce8425E",
            value: parseEther("0.0001"),
            maxFeePerGas: parseGwei("20"), // don't change this
            maxPriorityFeePerGas: parseGwei("20"), // don't change this
        });
    };

    const FormSchema = z.object({
        receiver: z.string().nonempty({
            message: "Receiver address is required",
        }),
        amount: z
            .string()
            .refine(
                (val) => !isNaN(Number(val)) && Number(val) >= 0.0001,
                "Amount must be at least 0.0001"
            ),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            amount: "0.0001",
        },
    });

    // Initial setup effect
    useEffect(() => {
        updateBalance();
    }, [ready, user?.wallet?.address]);

    return (
        <>
            <div className="relative w-full max-w-md mx-auto">
                <div className="absolute rounded-lg inset-0 bg-gradient-to-r via-violet-500 from-gray-400 to-indigo-700 opacity-20 pointer-events-none"></div>
                <Card className="relative bg-transparent w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center text-center">
                            <span>Smart Wallet Balance (Sepolia)</span>
                            {!smartWalletInitialized && (
                                <span className="text-xs text-yellow-500 ms-1">
                                    Initializing...
                                </span>
                            )}
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
                                    <p className="text-2xl font-bold">
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
                                    <span className="text-xs break-all text-gray-500">
                                        {user.smartWallet.address}
                                    </span>
                                </div>
                            )}

                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(
                                        sendSmartWalletTransaction
                                    )}
                                    className="w-full space-y-6"
                                >
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Amount"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="receiver"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Receiver"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        onClick={updateBalance}
                                        disabled={
                                            isLoading || !walletInitialized
                                        }
                                        className="w-full"
                                    >
                                        {isLoading
                                            ? "Refreshing..."
                                            : "Refresh Balance"}
                                    </Button>
                                    <Button
                                        // disabled={isLoading || !walletInitialized}
                                        className="w-full"
                                        type="submit"
                                    >
                                        Send Smart Wallet Transaction
                                    </Button>
                                </form>
                            </Form>
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
