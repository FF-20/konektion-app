"use client";
import { useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import MovingLogo from "./ui/moving-logo";

function LoginPage() {
    const { ready, authenticated } = usePrivy();
    const router = useRouter();

    const { login } = useLogin({
        onComplete: () => router.push("/dashboard"),
    });

    return (
        <div>

            <div className="flex justify-center h-[200px]">
            <MovingLogo />
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
                            onClick={login}
                        >
                            LET'S KONEK!
                        </Button>
                    )}
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-[10%] h-[50%]  bg-indigo-800 blur-[154.2px]"></div>
            <div className="absolute top-0 right-0 w-[10%] h-[50%]  bg-violet-500 blur-[154.2px]"></div>
        </div>
    );
}

export default LoginPage;
