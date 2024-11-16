import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
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
import { sepolia } from "viem/chains";
import { parseEther, parseGwei } from "viem";

function SendTx() {
    const { ready, user } = usePrivy();
    const [smartWalletBalance, setSmartWalletBalance] = useState<
        string | undefined
    >(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { client: smartContractClient } = useSmartWallets();

    const sendSmartWalletTransaction = async (
        values: z.infer<typeof FormSchema>
    ) => {
        const { amount, receiver } = values;
        setIsProcessing(true);
        setError(null);

        try {
            await sendTx(amount, receiver);
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

    const sendTx = async (amount: any, receiver: any) => {
        if (!smartContractClient || !user?.smartWallet?.address) {
            setError("Smart wallet not initialized");
            return;
        }

        const txHash = await smartContractClient.sendTransaction({
            account: smartContractClient.account,
            chain: sepolia,
            to: receiver,
            value: parseEther(amount),
            maxFeePerGas: parseGwei("20"), // don't change this
            maxPriorityFeePerGas: parseGwei("20"), // don't change this
        });
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

    return (
        <>
            <div className="relative w-full max-w-md mx-auto">
                <div className="absolute rounded-lg inset-0 bg-gradient-to-r via-violet-500 from-gray-400 to-indigo-700 opacity-20 pointer-events-none"></div>
                <Card className="relative bg-transparent w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex justify-center items-center text-center">
                            <p>Transfer</p>
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
                                        type="submit"
                                        disabled={
                                            isProcessing ||
                                            !user?.smartWallet?.address
                                        }
                                        className="w-full"
                                    >
                                        {isProcessing
                                            ? "Processing..."
                                            : "Send Transaction"}
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
}

export default SendTx;
