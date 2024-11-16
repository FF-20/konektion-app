"use client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type OnRampModalProps = {
    onrampUrl: string | null;
    onClose: () => void;
};

export default function OnrampModal({ onrampUrl, onClose }: OnRampModalProps) {
    const handleContinue = () => {
        if (!onrampUrl) return;
        window.open(onrampUrl, "_blank");
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    return (
        <Dialog open={onrampUrl !== null} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">
                        Fund your wallet with MoonPay
                    </DialogTitle>
                </DialogHeader>
                <img
                    src="https://cdn.freelogovectors.net/wp-content/uploads/2021/12/moonpay-logo-freelogovectors.net_.png"
                    alt="Moonpay"
                    className="w-24 h-24 mx-auto"
                />
                <div className="w-full px-4 pb-2 text-center">
                    <p className="mb-3">
                        This app partners with{" "}
                        <a
                            className="font-semibold text-indigo-600"
                            href="https://www.moonpay.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Moonpay
                        </a>{" "}
                        to help you fund your wallet.
                    </p>
                    <p className="mb-3">
                        Moonpay allows you to securely purchase crypto using
                        your credit card, debit card, bank account, Apple/Google
                        Pay, and more.
                    </p>
                    <p className="mb-3">
                        Click{" "}
                        <span className="font-semibold text-indigo-600">
                            Continue
                        </span>{" "}
                        to open Moonpay in a new tab.
                    </p>
                </div>
                <DialogFooter className="flex justify-center space-x-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleContinue}>
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}