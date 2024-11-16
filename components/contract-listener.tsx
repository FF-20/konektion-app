"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { usePrivy } from "@privy-io/react-auth";
import { useContract } from "@/context/contract-client";

const ContractListener = () => {
  const { ready, user } = usePrivy();
  const { contract } = useContract();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!contract || !user?.smartWallet?.address) return;

    const depositAddress = user.smartWallet.address;

    const fetchData = async () => {
      try {
        const depositedFilter = contract.filters.Deposited(depositAddress);
        const pastEvents = await contract.queryFilter(depositedFilter, 0, "latest");

        // Add past events to state
        const formattedEvents = pastEvents.map((e) => ({
          sender: e.args?.[0],
          amount: e.args?.[1]?.toString(),
          balance: e.args?.[2]?.toString(),
        }));
        setEvents((prev) => [...prev, ...formattedEvents]);
      } catch (error) {
        console.error("Error fetching past events:", error);
      }
    };

    fetchData();

    // Listen for new Deposited events
    const listener = (amount: ethers.BigNumber, balance: ethers.BigNumber, deposit: string) => {
      console.log("Deposited Event:", { amount, balance, deposit });
      setEvents((prevEvents) => [
        ...prevEvents,
        { type: "Deposited", amount: amount.toString(), balance: balance.toString(), deposit },
      ]);
    };
    contract.on("Deposited", listener);

    // Cleanup listeners on component unmount
    return () => {
      contract.removeAllListeners("Deposited");
    };
  }, [contract, user]);

  return (
    <div>
      <h1>Event Listener</h1>
      {events.map((event, index) => (
        <div key={index}>
          <h2>{event.type || "Unknown"} Event</h2>
          <pre>{JSON.stringify(event, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default ContractListener;
