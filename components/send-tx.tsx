import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useContract } from "@/context/contract-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";

function SendTx() {
    const { ready, user } = usePrivy();
    const [smartWalletBalance, setSmartWalletBalance] = useState<
        string | undefined
    >(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { client: smartContractClient } = useSmartWallets();
    const { contract } = useContract();

    useEffect(() => {
        if (!ready) return;

        updateBalance();
    }, [ready]);

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

    const sendSmartWalletTransaction = async (
        values: z.infer<typeof FormSchema>
    ) => {
        const { amount } = values;
        setIsProcessing(true);
        setError(null);

        try {
            const linkDetails = await sendTx(amount);
            console.log("Link details:", linkDetails);
        } catch (error) {
            console.error("Error sending transaction:", error);
            setError(
                `Failed to send transaction: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const registerLink = async () => {
        if (!user?.smartWallet?.address)
            throw new Error("Wallet not initialized");

        const uuid = uuidv4();
        // Define the domain and types
        const domain = {
            name: "Konektion",
            version: "1.0",
            chainId: 11155111, // Mainnet chain ID
            verifyingContract: "0x4cF9a9dd88BADCaa89FEA07d63dc489735634a7b",
        } as const;

        const types = {
            PaymentRequest: [
                { name: "sender", type: "address" },
                { name: "amount", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "expire", type: "uint256" },
            ],
        };

        // Get the current time in seconds since Unix epoch
        const currentTime = Math.floor(Date.now() / 1000);

        const expireTime = currentTime + 10 * 60;
        const amount = ethers.utils.parseEther("0.0001");

        const message = {
            sender: "0x347B1Ca4b3f9dea252cbd715ADC0B9b921017aD5",
            amount: amount,
            nonce: 648785,
            expire: expireTime,
        };

        if (user) {
            const signature = await smartContractClient?.signTypedData({
                account: smartContractClient.account.address,
                primaryType: "PaymentRequest",
                domain: domain,
                types: types,
                message: message,
            });
            console.log("Signature:", signature);
        }

        const linkData = {
            name: uuid,
            key: "paymentRequest",
        };

        const response = await fetch(
            "https://ens-gateway-worker.onrender.com/api/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(linkData),
            }
        );

        console.log("Response:", response);

        if (!response.ok) {
            throw new Error("Failed to register link");
        }

        return {
            uuid,
            link: `${window.location.origin}/claim/${uuid}`,
        };
    };

    const depositToContract = async (amount: string) => {
        if (!contract) throw new Error("Contract not initialized");

        try {
            const amountInWei = ethers.utils.parseEther(amount);
            const tx = await contract.Deposit(amountInWei);
            await tx.wait();
        } catch (error) {
            throw new Error(
                `Contract deposit failed: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    };

    const sendTx = async (amount: string) => {
        if (!smartContractClient || !user?.smartWallet?.address) {
            throw new Error("Smart wallet not initialized");
        }

        // Step 1: Generate and register the link
        const linkDetails = await registerLink();

        // Step 2: Deposit to the contract
        await depositToContract(amount);

        return linkDetails;
    };

    const FormSchema = z.object({
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

    return (
        <>
            <div className="relative w-full max-w-md mx-auto">
                <div className="absolute rounded-lg inset-0 bg-gradient-to-r via-violet-500 from-gray-400 to-indigo-700 opacity-20 pointer-events-none"></div>
                <Card className="relative bg-transparent w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex justify-center items-center text-center">
                            <p>Send</p>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
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
                                    <Button
                                        type="submit"
                                        disabled={
                                            isProcessing ||
                                            !user?.smartWallet?.address
                                        }
                                        className="w-full"
                                    >
                                        {isProcessing
                                            ? "Processing..."
                                            : "Generate Link"}
                                    </Button>
                                </form>
                            </Form>

                            <div className="flex items-center space-x-4">
                                <Input
                                    className="w-full"
                                    placeholder="Generated Link"
                                    disabled
                                />
                                <Button>
                                    <Copy />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="absolute bottom-0 left-0 w-[10%] h-[50%]  bg-indigo-800 blur-[154.2px]"></div>
            <div className="absolute top-0 right-0 w-[10%] h-[50%]  bg-violet-500 blur-[154.2px]"></div>
        </>
    );
}

export default SendTx;
