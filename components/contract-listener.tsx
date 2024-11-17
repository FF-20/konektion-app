"use client"
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import konketion_abi from '../konektion_contract_abi.json';
import { usePrivy } from '@privy-io/react-auth';
import { number, string } from 'zod';
import { Transaction } from '@solana/web3.js';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ContractListener = () => {
  const { ready, user } = usePrivy();
  const [events, setEvents] = useState<any[]>([]);//deposit events
  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);
  const [withdrawnEvents, setWithdrawnEvents] = useState<any[]>([]);//withdrawn events
  const contractAddress = "0x4cF9a9dd88BADCaa89FEA07d63dc489735634a7b";
  const abi = konketion_abi;
  const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/KNwBW-MbHLO0hfANek-rELIVCEvOJjxU");
  const contract = new ethers.Contract('0x4cF9a9dd88BADCaa89FEA07d63dc489735634a7b', abi, provider);
  const base_url = process.env.NEXT_BLOCKSCOUT_BASE_URL ?? "https://eth-sepolia.blockscout.com/api/v2/";

  type eventData = {
    sender: string,
    amount: string,
    balance: string
  }

  type transactionData = {
    sender: string,
    receiver: string,
    gas_used: string,
    value: string,
    txhash: string,
    timestamp: string
  }

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const depositedFilter = contract.filters.Deposited(user?.smartWallet?.address);
  //     const event = await contract.queryFilter(depositedFilter, 0, "latest");

  //     const eventTxHash = event.map(async (e) => await fetchTransactionData(e.transactionHash));
  //     await setEvents(eventTxHash);
  //     console.log("event",eventTxHash);
  //   };

  //   fetchData();

  //   // const fetchPaymentData = async () => {
  //   //   const paymentFilter = contract.filters.PaymentExecuted("0x4cF9a9dd88BADCaa89FEA07d63dc489735634a7b");
  //   //   const event = await contract.queryFilter(paymentFilter, 0, "latest");

  //   //   const eventTxHash = event.map(async (e) => await fetchTransactionData(e.transactionHash));
  //   //   setPaymentEvents(eventTxHash);
  //   //   console.log(eventTxHash);
  //   // }
  //   // fetchPaymentData();

  //   const fetchWithdrawData = async () => {
  //     const withdrawnFilter = contract.filters.Withdrawn(user?.smartWallet?.address);
  //     const event = await contract.queryFilter(withdrawnFilter, 0, "latest");

  //     const eventTxHash = event.map(async (e) => await fetchTransactionData(e.transactionHash));
  //     setWithdrawnEvents(eventTxHash);
  //     console.log(eventTxHash);
  //   }

  //   fetchWithdrawData();

  //   contract.on('Deposited', (...args) => {
  //     const event = args[args.length - 1];
  //     setEvents((prevEvents) => [...prevEvents, fetchTransactionData(event.transactionHash)]
  //       .filter((value, index, self) => self.indexOf(value) === index)
  //     );
  //   });

  //   // contract.on('PaymentExecuted', (...args) => {
  //   //   const event = args[args.length - 1];
  //   // });

  //   contract.on('Withdrawn', (...args) => {
  //     const event = args[args.length - 1];
  //     setWithdrawnEvents((prevEvents) => [...prevEvents, fetchTransactionData(event.transactionHash)]
  //       .filter((value, index, self) => self.indexOf(value) === index)
  //     );
  //   });
  // }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const depositedFilter = contract.filters.Deposited(user?.smartWallet?.address);
        const events = await contract.queryFilter(depositedFilter, 0, "latest");

        // Resolve all transaction data
        const resolvedEvents = await Promise.all(
          events.map(async (e) => await fetchTransactionData(e.transactionHash))
        );

        // Remove duplicates
        const uniqueEvents = Array.from(
          new Map(resolvedEvents.map((e) => [e.txhash, e])).values()
        );

        setEvents(uniqueEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchData();

    const fetchWithdrawnData = async () => {
      try {
        const withdrawnFilter = contract.filters.Withdrawn(user?.smartWallet?.address);
        const events = await contract.queryFilter(withdrawnFilter, 0, "latest");

        // Resolve all transaction data
        const resolvedEvents = await Promise.all(
          events.map(async (e) => await fetchTransactionData(e.transactionHash))
        );

        // Remove duplicates
        const uniqueEvents = Array.from(
          new Map(resolvedEvents.map((e) => [e.txhash, e])).values()
        );

        setWithdrawnEvents(uniqueEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchWithdrawnData();

    const fetchPaymentData = async () => {
      const paymentFilter = contract.filters.PaymentExecuted(user?.smartWallet?.address);
      const event = await contract.queryFilter(paymentFilter, 0, "latest");
      console.log("event", event);
      // const eventTxHash = event.map(async (e) => await fetchTransactionData(e.transactionHash));
      // setPaymentEvents(eventTxHash);
      // console.log(eventTxHash);
    }
    fetchPaymentData();

    // contract.on('Deposited', async (...args) => {
    //   try {
    //     const event = args[args.length - 1];
    //     const newTransaction = await fetchTransactionData(event.transactionHash);

    //     setEvents((prevEvents) => {
    //       const updatedEvents = [...prevEvents, newTransaction];
    //       return Array.from(
    //         new Map(updatedEvents.map((e) => [e.txhash, e])).values()
    //       );
    //     });
    //   } catch (error) {
    //     console.error("Error handling Deposited event:", error);
    //   }
    // });

    return () => {
      contract.removeAllListeners('Deposited');
    };
  }, []);


  //fetch blockscout transaction data
  const fetchTransactionData = async (transactionHash: string) => {
    try {
      if (!transactionHash) {
        throw new Error('Transaction hash is required');
      }
      const response = await fetch(`${base_url}transactions/${transactionHash}?module=transaction&action=gettxinfo&apikey=de91b67d-ebe1-45d9-9f1e-f66ada31dbed`);
      const json = await response.json();
      let data: transactionData = {
        sender: json.from.hash,
        receiver: json.to.hash,
        gas_used: json.gas_used,
        value: ethers.utils.formatEther(json.value),
        txhash: json.hash,
        timestamp: json.timestamp
      }
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit">Sent</TabsTrigger>
          <TabsTrigger value="withdraw">Received</TabsTrigger>
        </TabsList>
        <TabsContent value="deposit">
          <Table className='w-full'>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Timestamp</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Gas Used</TableHead>
                <TableHead className="text-right">Amount (ETH)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.txhash}>
                  <TableCell className="font-medium">{event.timestamp}</TableCell>
                  <TableCell>{event.sender}</TableCell>
                  <TableCell>{event.receiver}</TableCell>
                  <TableCell>{event.gas_used}</TableCell>
                  <TableCell className="text-right">{event.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="withdraw">
          <Table className='w-full'>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Timestamp</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Gas Used</TableHead>
                <TableHead className="text-right">Amount (ETH)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawnEvents.map((event) => (
                <TableRow key={event.txhash}>
                  <TableCell className="font-medium">{event.timestamp}</TableCell>
                  <TableCell>{event.sender}</TableCell>
                  <TableCell>{event.receiver}</TableCell>
                  <TableCell>{event.gas_used}</TableCell>
                  <TableCell className="text-right">{event.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ContractListener;
