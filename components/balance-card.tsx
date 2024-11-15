"use client";
import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseEther, parseGwei, defineChain } from "viem";
import { sepolia } from "viem/chains";
import { zodResolver } from "@hookform/resolvers/zod"
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
// import { useWriteContract } from "wagmi";
import { createPublicClient, http } from 'viem';
import { scrollSepolia } from 'viem/chains';
import twosball from '../context/twosball.json'

const BalanceCard = () => {
  const { ready, user } = usePrivy();
  const [balance, setBalance] = useState<string | undefined>(undefined);
  const [smartWalletBalance, setSmartWalletBalance] = useState<
    string | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletInitialized, setWalletInitialized] = useState(false);
  const [smartWalletInitialized, setSmartWalletInitialized] = useState(false);
  const { client: smartContractClient } = useSmartWallets();
  // const { writeContract } = useWriteContract();

  const scrollSepolias = defineChain({
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

  // Client to test call contract.
  const viemClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  const getProvider = () => {
    return new ethers.providers.EtherscanProvider(
      "sepolia",
      process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
    );
  };

  const updateBalance = async () => {
    console.log(user);
    if (!ready || !user?.wallet?.address || !user?.smartWallet?.address) {
      console.log("Skipping balance update - prerequisites not met");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const provider = getProvider();
      if (user.wallet) {
        const balanceInWei = await provider.getBalance(user.wallet.address);
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



  const FormSchema = z.object({
    receiver: z.string(),
    amount: z.string()
        .refine(
            (val) => !isNaN(Number(val)) && Number(val) >= 0.0001,
            "Amount must be at least 0.0001"
        )
})

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: "0.0001",
    },
  });

  type FormInput = {
    receiver: string;
    amount: string;
  };

  const sendSmartWalletTransaction = async (values: FormInput) => {
    console.log("Sending transaction");
    if (!smartContractClient)
        return;
    console.log(smartContractClient);
    const txHash = await smartContractClient.sendTransaction({
        account: smartContractClient.account,
        chain: sepolia,
        to: '0xbc0b9bC6c967BA2e837F4D0069Ed2C2c8ce8425E', // SW address.
        // to: `0x${values.receiver.slice(2)}`,
        value: parseEther('0.01'),  
        // value: parseEther(values.amount),
        maxFeePerGas: parseGwei('2'), // don't change this
        maxPriorityFeePerGas: parseGwei('2'), // don't change this
    })
    console.log(txHash);
};

  const testSmartContractCall = async () => {
    // console.log("test call");
    // writeContract({
    //   abi: twosball,
    //   address: "0x8Bbf08B5E9F88F8CAdb0d4760b1C60E25edaFba1",
    //   functionName: "deposit",
    //   args: [parseEther("0.001")],
    // });
    const result = await viemClient.simulateContract({
      address: '0x8Bbf08B5E9F88F8CAdb0d4760b1C60E25edaFba1',
      abi: twosball,
      functionName: 'deposit',
      args: [parseEther('0.001')], // Replace with actual arguments
    });

    console.log(result);
  };

  // Initial setup effect
  useEffect(() => {
    updateBalance();
  }, [ready, user?.wallet?.address]);

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-center">
            <span>Regular Wallet Balance (Sepolia)</span>
            {!walletInitialized && (
              <span className="text-xs text-yellow-500 ms-1">
                Initializing...
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

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
                  {balance ? `${Number(balance).toFixed(4)} ETH` : "0 ETH"}
                </p>
              )}
            </div>

            {user?.wallet?.address && (
              <div className="text-center">
                <span className="text-xs break-all text-gray-500">
                  {user.wallet.address}
                </span>
              </div>
            )}

            <Button
              onClick={updateBalance}
              disabled={isLoading || !walletInitialized}
              className="w-full"
            >
              {isLoading ? "Refreshing..." : "Refresh Balance"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full max-w-md mx-auto">
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
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

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
                    ? `${Number(smartWalletBalance).toFixed(4)} ETH`
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
                onSubmit={form.handleSubmit(sendSmartWalletTransaction)}
                className="w-full space-y-6"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Amount" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receiver"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Receiver" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  onClick={updateBalance}
                  disabled={isLoading || !walletInitialized}
                  className="w-full"
                >
                  {isLoading ? "Refreshing..." : "Refresh Balance"}
                </Button>
                <Button
                  //   onClick={sendSmartWalletTransaction}
                  // disabled={isLoading || !walletInitialized}
                  className="w-full"
                  type="submit"
                >
                  Send Smart Wallet Transaction
                </Button>
              </form>
            </Form>

            {/* <Button
              onClick={sendSmartWalletTransaction}
              // disabled={isLoading || !walletInitialized}
              className="w-full"
            >
              Send Smart Wallet Transaction
            </Button> */}

            <Button
              onClick={testSmartContractCall}
              className="w-full"
            >
              Testing Smart Contract Sponsored Call
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default BalanceCard;
