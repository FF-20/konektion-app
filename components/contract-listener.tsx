"use client"
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import konketion_abi from '../konektion_contract_abi.json';
import { usePrivy } from '@privy-io/react-auth';

const ContractListener = () => {
    const { ready, user } = usePrivy();
    const [events, setEvents] = useState<any[]>([]);
    const contractAddress = "0x9fe1B04D7a2BeB28BfAE67929839C8Fd6eE68174";
    const abi = konketion_abi;
    const provider = new ethers.providers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/PyHuKifH8_cFpWgGU0G6HKCA8D366R9X");


    const contract = new ethers.Contract('0x9fe1B04D7a2BeB28BfAE67929839C8Fd6eE68174', abi, provider);

    useEffect(() => {
        const fetchData = async () => {
            const depositedFilter = contract.filters.Deposited("0x347B1Ca4b3f9dea252cbd715ADC0B9b921017aD5");

            const event = await contract.queryFilter(
                //Simply used the queryfilter to listen to the transfer event everytime a block is mined.
                depositedFilter,
                0,
                "latest"
            );
            // event.map((e) => {
            //     return {
            //         sender: e.args?[0]
            //         amount: e.args?[1],
            //         balance: e.args?[2]
            //     }
            // });
            console.log(event);
        }


        // Filter for a specific deposit address (indexed parameter)
        const depositAddress = user?.smartWallet?.address; // Replace with the desired address
        fetchData()
        // Create a filter for the Deposited event
        
        // Listen for filtered Deposited events
        //provider.on(depositedFilter, async (deposit, amount, balance) => {
            contract.on('Deposited', (amount, balance, deposit) => {
                console.log(amount, balance, deposit);
            });

            // console.log(`Deposited Event: deposit=${deposit}, amount=${amount}, balance=${balance}`);
            // setEvents((prevEvents) => [
            //     ...prevEvents,
            //     { type: "Deposited", deposit, amount: amount.toString(), balance: balance.toString() },
            // ]);
        //});


        // listen to any event on the contract using event name

        // // Filter for a specific from-to pair in Payment event
        // const fromAddress = "0x1234..."; // Replace with the desired sender address
        // const toAddress = "0xABCD..."; // Replace with the desired recipient address
        // const paymentFilter = contract.filters.Payment(fromAddress, toAddress);

        // // Listen for filtered Payment events
        // provider.on(paymentFilter, (from, to, amount) => {
        //     console.log(`Payment Event: from=${from}, to=${to}, amount=${amount}`);
        //     setEvents((prevEvents) => [
        //         ...prevEvents,
        //         { type: "Payment", from, to, amount: amount.toString() },
        //     ]);
        // });

        // Cleanup on component unmount
        return () => {
            //provider.removeAllListeners(depositedFilter);
            // provider.removeAllListeners(paymentFilter);
        };
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
