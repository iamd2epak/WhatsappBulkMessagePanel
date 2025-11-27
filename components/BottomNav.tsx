"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Send, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const menuItems = [
    { icon: LayoutDashboard, label: "Home", href: "/" },
    { icon: Send, label: "Broadcast", href: "/broadcast" },
];

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 pb-safe z-50">
            <div className="flex items-center justify-around p-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[64px]",
                                isActive
                                    ? "text-green-400"
                                    : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-full transition-all",
                                isActive ? "bg-green-500/10" : "bg-transparent"
                            )}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}

                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500 hover:text-red-400 transition-all duration-200 min-w-[64px]"
                >
                    <div className="p-1.5 rounded-full bg-transparent hover:bg-red-500/10 transition-all">
                        <LogOut className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
