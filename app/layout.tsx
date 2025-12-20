import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/components/providers/data-provider";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: {
        default: "DecorSense Gifts & Surprises | Premium Gifting Service",
        template: "%s | DecorSense"
    },
    description: "Premier gifting and surprise delivery service in Accra, Ghana. Customized luxury packages, money bouquets, and event decor.",
    metadataBase: new URL("https://decorsense-giftshop.vercel.app"), // Placeholder
    openGraph: {
        title: "DecorSense Gifts & Surprises",
        description: "Make every moment magical with our premium surprises.",
        siteName: "DecorSense",
        locale: "en_GH",
        type: "website",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(outfit.className, "min-h-screen bg-background antialiased flex flex-col")}>
                <DataProvider>
                    {children}
                    <Toaster position="top-center" richColors />
                </DataProvider>
            </body>
        </html>
    );
}
