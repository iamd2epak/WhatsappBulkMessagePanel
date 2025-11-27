import "./globals.css";
import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import ClientLayout from "@/components/ClientLayout";
import type { Metadata, Viewport } from "next";

const font = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "WaBulkSender - Free WhatsApp Bulk Sender",
    description: "Open source WhatsApp bulk sender using Official Cloud API",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={cn(font.className, "bg-black text-white")}>
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
