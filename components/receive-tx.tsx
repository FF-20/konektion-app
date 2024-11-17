import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const formSchema = z.object({
    link: z.string().nonempty(),
});

function ReceiveTx() {
    const { ready, user } = usePrivy();
    const [smartWalletBalance, setSmartWalletBalance] = useState<
        string | undefined
    >(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { client: smartContractClient } = useSmartWallets();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            link: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }
    return (
        <>
            <div className="relative w-full max-w-md mx-auto">
                <div className="absolute rounded-lg inset-0 bg-gradient-to-r via-violet-500 from-gray-400 to-indigo-700 opacity-20 pointer-events-none"></div>
                <Card className="relative bg-transparent w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex justify-center items-center text-center">
                            <p>Receive</p>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-8"
                                >
                                    <FormField
                                        control={form.control}
                                        name="link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Link</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="uuid.testbuild.eth"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Enter the link to receive
                                                    payment
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit">Submit</Button>
                                </form>
                            </Form>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="absolute bottom-0 left-0 w-[10%] h-[50%]  bg-indigo-800 blur-[154.2px]"></div>
            <div className="absolute top-0 right-0 w-[10%] h-[50%]  bg-violet-500 blur-[154.2px]"></div>
        </>
    );
}

export default ReceiveTx;
