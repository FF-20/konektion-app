import { NextResponse, NextRequest } from "next/server";
import { PrivyClient, AuthTokenClaims } from "@privy-io/server-auth";
import crypto from "crypto";
import { cookies } from "next/headers";

export type APIError = {
    error: string;
    cause?: string;
};

export type AuthenticateSuccessResponse = {
    claims: AuthTokenClaims;
};

export type AuthenticationErrorResponse = {
    error: string;
};

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const MOONPAY_BASE_URL = process.env.MOONPAY_BASE_URL;
const MOONPAY_SECRET_KEY = process.env.MOONPAY_SECRET_KEY as string;
const SMART_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS as string;

if (!MOONPAY_SECRET_KEY) {
    throw new Error("Moonpay secret key is not defined in environment variables.");
}

if (!SMART_CONTRACT_ADDRESS) {
    throw new Error("Smart contract address is not defined in environment variables.");
}

const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

export async function POST(request: NextRequest) {
    // Authenticate user
    const { redirectUrl, theme, authToken, email } = await request.json();
    const cookieStore = cookies();
    const cookieAuthToken = cookieStore.get("privy-token")?.value;

    const finalAuthToken = authToken || cookieAuthToken;

    if (!finalAuthToken) {
        return NextResponse.json(
            { error: "Missing auth token" } as AuthenticationErrorResponse,
            { status: 401 }
        );
    }

    try {
        const claims = await client.verifyAuthToken(finalAuthToken);

        if (typeof redirectUrl !== "string") {
            return NextResponse.json(
                { error: "Client must provide a redirect URL" },
                { status: 412 }
            );
        }

        // Construct the onramp URL, using the smart contract address instead of user's wallet
        let onrampUrl = new URL(MOONPAY_BASE_URL as string);
        onrampUrl.searchParams.set("apiKey", process.env.MOONPAY_API_KEY as string);
        onrampUrl.searchParams.set("walletAddress", SMART_CONTRACT_ADDRESS);
        onrampUrl.searchParams.set("redirectURL", redirectUrl);

        // (Optional) If user has an email linked, specify the user's email to pre-fill for KYC
        if (typeof email === "string") onrampUrl.searchParams.set("email", email);
        onrampUrl.searchParams.set("currencyCode", "eth");
        onrampUrl.searchParams.set("theme", theme);

        // (Required) Sign the onramp URL with your Moonpay secret key
        const urlSignature = crypto
            .createHmac("sha256", MOONPAY_SECRET_KEY)
            .update(onrampUrl.search)
            .digest("base64");
        onrampUrl.searchParams.set("signature", urlSignature);

        // Return the onramp URL to the client along with the authenticated claims
        return NextResponse.json({
            url: onrampUrl.toString(),
            claims,
            contractAddress: SMART_CONTRACT_ADDRESS,
        } as AuthenticateSuccessResponse & { contractAddress: string });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message } as AuthenticationErrorResponse,
            { status: 401 }
        );
    }
}