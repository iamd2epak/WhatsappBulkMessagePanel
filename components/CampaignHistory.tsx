"use client";

import { useEffect, useState } from "react";
import { getCampaigns, Campaign } from "@/lib/db";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

export default function CampaignHistory() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        const data = await getCampaigns();
        setCampaigns(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No campaigns found. Start your first broadcast!
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-800/50 text-gray-200 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4 rounded-tl-xl">Date</th>
                        <th className="px-6 py-4">Template</th>
                        <th className="px-6 py-4 text-center">Total</th>
                        <th className="px-6 py-4 text-center">Success</th>
                        <th className="px-6 py-4 text-center">Failed</th>
                        <th className="px-6 py-4 rounded-tr-xl text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    {campaign.createdAt?.seconds
                                        ? new Date(campaign.createdAt.seconds * 1000).toLocaleDateString()
                                        : "Just now"}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-white">{campaign.templateName}</td>
                            <td className="px-6 py-4 text-center">{campaign.totalRecipients}</td>
                            <td className="px-6 py-4 text-center text-green-400">{campaign.successful}</td>
                            <td className="px-6 py-4 text-center text-red-400">{campaign.failed}</td>
                            <td className="px-6 py-4 text-right">
                                <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.status === "completed"
                                            ? "bg-green-500/10 text-green-400"
                                            : "bg-yellow-500/10 text-yellow-400"
                                        }`}
                                >
                                    {campaign.status === "completed" ? (
                                        <CheckCircle2 className="w-3 h-3" />
                                    ) : (
                                        <XCircle className="w-3 h-3" />
                                    )}
                                    {campaign.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
