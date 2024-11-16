"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./konektion.json";

const ContractContext = createContext<{
    contract: ethers.Contract | null;
    isConnected: boolean;
    connect: () => Promise<void>;
}>({
    contract: null,
    isConnected: false,
    connect: async () => {},
});

export const ContractProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const initializeContract = async () => {
        try {
            const { ethereum } = window as any;
            if (!ethereum) {
                console.log("Ethereum object doesn't exist!");
                return;
            }

            // const url = "https://mainnet.base.org";
            const url = "https://base-sepolia.g.alchemy.com/v2/PyHuKifH8_cFpWgGU0G6HKCA8D366R9X"
            const provider = new ethers.providers.JsonRpcProvider(url);
            // const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();

            const contractAddress =
                process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;
            if (!contractAddress) {
                throw new Error("Contract address not found");
            }

            const konektionContract = new ethers.Contract(
                contractAddress,
                abi,
                signer
            );
            console.log("contract", konektionContract);
            setContract(konektionContract);
            setIsConnected(true);
        } catch (error) {
            console.error("Error initializing contract:", error);
            setIsConnected(false);
        }
    };

    const connect = async () => {
        try {
            const { ethereum } = window as any;
            if (!ethereum) {
                alert("Please install MetaMask!");
                return;
            }

            await ethereum.request({ method: "eth_requestAccounts" });
            await initializeContract();
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
        }
    };

    useEffect(() => {
        // Check if already connected
        const checkConnection = async () => {
            const { ethereum } = window as any;
            if (ethereum && ethereum.selectedAddress) {
                await initializeContract();
            }
        };

        checkConnection();
    }, []);

    return (
        <ContractContext.Provider value={{ contract, isConnected, connect }}>
            {children}
        </ContractContext.Provider>
    );
};

export const useContract = () => {
    const context = useContext(ContractContext);
    if (!context) {
        throw new Error("useContract must be used within a ContractProvider");
    }
    return context;
};
