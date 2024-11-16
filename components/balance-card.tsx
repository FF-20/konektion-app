/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseEther, parseGwei, defineChain, encodeFunctionData } from "viem";
import { baseSepolia, sepolia, scrollSepolia } from "viem/chains";
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
// import { useWriteContract } from "wagmi";
import { createPublicClient, http } from "viem";
import twosball from "../context/twosball.json";

import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createSmartAccountClient } from "permissionless";
import {
  toSimpleSmartAccount,
  toSafeSmartAccount,
  toEcdsaKernelSmartAccount,
} from "permissionless/accounts";
import { privateKeyToAccount } from "viem/accounts";
import ContractListener from "./contract-listener";

const account = {};

const BalanceCard = () => {
  const { ready, user } = usePrivy();
  const [balance, setBalance] = useState<string | undefined>(undefined);
  const [smartWalletBalance, setSmartWalletBalance] = useState<
    string | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletInitialized, setWalletInitialized] = useState(false);
  const [smartWalletInitialized, setSmartWalletInitialized] = useState(true);
  const { client } = useSmartWallets();

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
    chain: baseSepolia,
    transport: http(),
  });

  //THIS
  const baseTx = async () => {
    console.log("zesty");
    const rpcUrl =
      "https://api.developer.coinbase.com/rpc/v1/base-sepolia/oIivHYJeI70CgGdccASaEfX8E6eXj8IU"; // Get yours at https://www.coinbase.com/cloud/products/base/rpc

    const cloudPaymaster = createPimlicoClient({
      chain: baseSepolia,
      transport: http(rpcUrl),
    });
    console.log(cloudPaymaster);

    const smartAccountClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl),
    });
    console.log(smartAccountClient);

    const owner = privateKeyToAccount(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    );
    console.log(owner);

    const account = await toSimpleSmartAccount({
      owner,
      client: smartAccountClient,
      entryPoint: {
        address: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        version: "0.6",
      },
    });
    console.log(account);

    // const account = "";
    const baseSmartWalletClient = createSmartAccountClient({
      account,
      chain: baseSepolia,
      bundlerTransport: http(rpcUrl),
      paymaster: cloudPaymaster,
    });
    console.log(baseSmartWalletClient);

    const callData = encodeFunctionData({
      abi: twosball,
      functionName: "mintTo",
      args: [baseSmartWalletClient.account.address, 0],
    });

    const txHash = await baseSmartWalletClient.sendTransaction({
      account: baseSmartWalletClient.account,
      to: "0x66519FCAee1Ed65bc9e0aCc25cCD900668D3eD49",
      data: callData,
      value: BigInt(0),
    });

    console.log(txHash);
  };

  const getProvider = () => {
    return new ethers.providers.EtherscanProvider(
      "sepolia",
      process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
    );
  };

  async function getSmartWalletBalance(address: any) {
    try {
      // Get the balance
      const balance = await viemClient.getBalance({
        address: address,
      });

      // Format balance to ether
      const balanceInEther = balance / BigInt(10 ** 18);

      return {
        wei: balance,
        ether: balanceInEther,
      };
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      throw error;
    }
  }

  const updateBalance = async () => {
    // console.log(user);
    // if (!ready || !user?.wallet?.address || !user?.smartWallet?.address) {
    //   console.log("Skipping balance update - prerequisites not met");
    //   return;
    // }

    // setIsLoading(true);
    // setError(null);

    // try {
    //   const provider = getProvider();
    //   if (user.wallet) {
    //     const balanceInWei = await provider.getBalance(user.wallet.address);
    //     const balanceInEth = ethers.utils.formatEther(balanceInWei);
    //     // const smartWallet = user?.linkedAccounts.find((account) => account.type === "smart_wallet")
    //     console.log(user?.linkedAccounts);
    //     console.log(user);

    //     setBalance(balanceInEth);
    //     setWalletInitialized(true);
    //   }
    //   if (user.smartWallet) {
    //     const swBalanceInWei = await provider.getBalance(
    //       user.smartWallet.address
    //     );
    //     const swBalanceInEth = ethers.utils.formatEther(swBalanceInWei);

    //     setSmartWalletBalance(swBalanceInEth);
    //     setSmartWalletInitialized(true);
    //   }
    // } catch (error) {
    //   console.error("Error fetching balance:", error);
    //   setError(
    //     `Failed to fetch balance: ${
    //       error instanceof Error ? error.message : "Unknown error"
    //     }`
    //   );
    //   setWalletInitialized(false);
    // } finally {
    //   setIsLoading(false);
    // }


    // const balance = await getSmartWalletBalance(
    //   "0x040B97f5074E905C8fcd301Bf0815B78A001235D"
    // );
    // console.log(balance);
    // const balanceInEth = ethers.utils.formatEther(balance.wei);
    // setSmartWalletBalance(balanceInEth);
    // console.log("SHOUDL DISPLAY: ", balanceInEth);
  };

  const FormSchema = z.object({
    receiver: z.string(),
    amount: z
      .string()
      .refine(
        val => !isNaN(Number(val)) && Number(val) >= 0.0001,
        "Amount must be at least 0.0001"
      ),
  });

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
    updateBalance();
    console.log("SCC:", client)
    if (!client) return;
    console.log(client.client);
    console.log(baseSepolia);

    const txHash = await client.sendTransaction({
      account: client.account,
      chain: client.chain,
      to: "0x3E62e75e71Ae8342F255cF6A8A3574fcdC1C7610", // SW address.
      // to: `0x${values.receiver.slice(2)}`,
      value: parseEther("0.01"),
      // value: parseEther(values.amount),
      maxFeePerGas: parseGwei("2"), // don't change this
      maxPriorityFeePerGas: parseGwei("2"), // don't change this
      // maxFeePerGas: parseGwei("20"),
      // maxPriorityFeePerGas: parseGwei("0")
    });

    console.log(txHash);
    // baseTx();
  };

  const testSmartContractCall = async () => {
    updateBalance();
    // console.log("test call");
    // writeContract({
    //   abi: twosball,
    //   address: "0x8Bbf08B5E9F88F8CAdb0d4760b1C60E25edaFba1",
    //   functionName: "deposit",
    //   args: [parseEther("0.001")],
    // });
    const result = await viemClient.simulateContract({
      address: "0x9fe1B04D7a2BeB28BfAE67929839C8Fd6eE68174",
      abi: twosball,
      functionName: "Deposit",
      args: [BigInt(123)], // Replace with actual arguments
      value: BigInt(1e18),
    });

    console.log(result);
  };

  // Initial setup effect
  useEffect(() => {
    updateBalance();
  }, []);

  return (
    <>
      {/* <div className="w-full max-w-md mx-auto inset-0 bg-gradient-to-r via-violet-500 from-slate-900 to-indigo-700 opacity-35">
        <Card className="w-full max-w-md mx-auto inset-0 bg-transparent">
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
      </div> */} 
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

            <Button onClick={testSmartContractCall} className="w-full">
              Testing Smart Contract Sponsored Call
            </Button>
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
      </div >
      <div className="absolute bottom-0 left-0 w-[10%] h-[50%]  bg-indigo-800 blur-[154.2px]"></div>
      <div className="absolute top-0 right-0 w-[10%] h-[50%]  bg-violet-500 blur-[154.2px]"></div>
      <ContractListener />
    </>
  );
};

export default BalanceCard;
