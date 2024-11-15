import BalanceCard from "@/components/balance-card";

export default function DashboardPage() {
    return (
        <>
            <main className="flex flex-col min-h-screen py-6 sm:py-10 bg-privy-light-blue space-y-2">
                <h1 className="text-3xl text-center font-bold">Welcome Back</h1>
                <BalanceCard />
            </main>
        </>
    );
}
