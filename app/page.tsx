"use client";

import { Users, MessageCircle, BarChart3, ArrowUpRight } from "lucide-react";
import CampaignHistory from "@/components/CampaignHistory";
import Link from "next/link";

export default function Home() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400 mt-2">Overview of your recent broadcast campaigns.</p>
                </div>
                <Link href="/broadcast">
                    <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-green-900/20 flex items-center gap-2 hover:scale-105 active:scale-95">
                        <MessageCircle className="w-5 h-5" />
                        New Broadcast
                    </button>
                </Link>
            </div>

            {/* Main Content - Campaign History */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-green-400" />
                        Recent Activity
                    </h3>
                </div>
                <CampaignHistory />
            </div>
        </div>
    );
}
