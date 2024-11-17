"use client";
import BalanceCard from "@/components/balance-card";
import DepositBtn from "@/components/deposit-btn";
import SendTx from "@/components/send-tx";
import ReceiveTx from "@/components/receive-tx";
import ContractListener from "@/components/contract-listener";

export default function DashboardPage() {
    return (
        <>
            <main className="flex flex-col min-h-screen py-6 sm:py-10 bg-privy-light-blue space-y-2 min-w-fit md:w-1/3">
                <h1 className="text-3xl text-center font-bold">Welcome Back</h1>
                <DepositBtn />
                <div className="grid gap-3 md:gap-6 md:grid-cols-3">
                    <BalanceCard />
                    <SendTx />
                    <ReceiveTx />
                </div>
                <ContractListener/>
            </main>
        </>
    );
}
