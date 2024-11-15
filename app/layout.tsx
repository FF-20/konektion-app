import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Raleway } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

const raleWay = Raleway({
    subsets: ["latin"],
    variable: "--font-raleway",
    weight: ["300", "400", "500", "600", "700"],
});

const APP_NAME = "Konektion";
const APP_DEFAULT_TITLE = "Konektion";
const APP_TITLE_TEMPLATE = "Konektion";
const APP_DESCRIPTION = "Let's Konek👉👈";

export const metadata: Metadata = {
    applicationName: "KONEKTION",
    title: {
        default: APP_DEFAULT_TITLE,
        template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: APP_DEFAULT_TITLE,
        // startUpImage: [],
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: "website",
        siteName: APP_NAME,
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
    twitter: {
        card: "summary",
        title: {
            default: APP_DEFAULT_TITLE,
            template: APP_TITLE_TEMPLATE,
        },
        description: APP_DESCRIPTION,
    },
};

export const viewport: Viewport = {
    themeColor: "#FFFFFF",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={raleWay.variable}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <main className="min-h-screen flex flex-col items-center">
                        <div className="flex-1 w-full flex flex-col items-center h-full">
                            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 z-50">
                                <div className="w-full max-w-5xl flex justify-between items-center p-3 text-sm">
                                    <div className="flex gap-5 items-center font-semibold">
                                        <Link
                                            href="/"
                                            className="flex items-center gap-2"
                                        >
                                            <img
                                                src="/android-chrome-192x192.png"
                                                alt="Konektion"
                                                className="h-7 w-7"
                                            />
                                            <span>Konektion</span>
                                        </Link>
                                    </div>
                                    <div className="flex items-center">
                                        <ThemeSwitcher />
                                    </div>
                                </div>
                            </nav>
                            <div className="flex flex-1 justify-center items-center w-full h-full max-w-5xl">
                                {children}
                            </div>
                        </div>
                    </main>
                </ThemeProvider>
            </body>
        </html>
    );
}
