"use client"
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import konketion_abi from '../konektion_contract_abi.json';
import { usePrivy } from '@privy-io/react-auth';
import { number, string } from 'zod';

const ContractListener = () => {
    const { ready, user } = usePrivy();
    const [events, setEvents] = useState<any[]>([]);
    const contractAddress = "0x9fe1B04D7a2BeB28BfAE67929839C8Fd6eE68174";
    const abi = konketion_abi;
    const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/KNwBW-MbHLO0hfANek-rELIVCEvOJjxU");
    const contract = new ethers.Contract('0x899b446881870B8eFB0a5D52FEA378D7Ef746399', abi, provider);

    type eventData = {
        sender: string,
        amount: string,
        balance: string
    }

    useEffect(() => {
        const fetchData = async () => {
            const depositedFilter = contract.filters.Deposited("0xC9Fea8dfcf76543AE7250e32DEEf5DC452d7FD0E");
            const event = await contract.queryFilter(depositedFilter, 0, "latest");
    
            const eventTxHash = event.map((e) => e.transactionHash);
            setEvents(eventTxHash);
            console.log(eventTxHash);
        };
    
        fetchData(); 
        
        contract.on('Deposited', (...args) => {
            const event = args[args.length - 1];
            setEvents((prevEvents) => [...prevEvents, event.transactionHash].filter((value, index, self) => self.indexOf(value) === index));
        }); 
    }, []);
    

    return (
        <div>
            <div>Event Listener</div>
            {events.map((event, index) => (
                // console.log(event),
                <div key={index}>
                    <h2>{event.type} Event</h2>
                    <p>{JSON.stringify(event)}</p>
                </div>
            ))}
        </div>
    );
};

export default ContractListener;
