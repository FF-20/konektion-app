"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

function LoginPage() {
    const { ready, authenticated } = usePrivy();
    const router = useRouter();

    return (
        <div>
            <div className="flex justify-center">
                <img src="/logo.png" alt="Konektion" className="z-0" />
            </div>
            <h1 className="uppercase font-bold text-7xl md:text-8xl text-center mb-12 z-0">
                Konektion
            </h1>

            <div>
                <p className="text-center max-w-md mx-auto mb-6 z-0">
                    Access All Blockchain Applications.<br/>For Everyone.
                </p>
                <div className="flex justify-center">
                    {ready && authenticated ? (
                        <Button
                            className="bg-[#666eff] hover:bg-[#666eff]/90 py-3 px-6 text-white rounded-lg transition-colors z-20"
                            onClick={() => router.push("/dashboard")}
                        >
                            Dashboard
                        </Button>
                    ) : (
                        <Button
                            className="bg-[#666eff] hover:bg-[#666eff]/90 py-3 px-6 text-white rounded-lg transition-colors z-20"
                            // onClick={login}
                        >
                            KONEK NOW!
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
