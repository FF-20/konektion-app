"use client";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import {UserPill} from '@privy-io/react-auth/ui';

export default function AuthButton() {
    const router = useRouter();

    const {
        ready,
        authenticated
    } = usePrivy();

    useEffect(() => {
        if (ready && !authenticated) {
            router.push("/");
        }
    }, [ready, authenticated, router]);

    return <UserPill />;
}
