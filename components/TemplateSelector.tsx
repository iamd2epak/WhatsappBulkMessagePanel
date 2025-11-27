"use client";

import { useState, useEffect } from "react";
import { Search, LayoutTemplate, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
    onSelect: (template: any) => void;
    accessToken: string;
    wabaId: string;
}

export default function TemplateSelector({ onSelect, accessToken, wabaId }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (accessToken && wabaId) {
            fetchTemplates();
        }
    }, [accessToken, wabaId]);

    const fetchTemplates = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `/api/whatsapp/templates?accessToken=${accessToken}&wabaId=${wabaId}`
            );
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setTemplates(data.data || []);
        } catch (err: any) {
            setError(err.message);
            // Fallback for demo if API fails or credentials invalid
            if (err.message.includes("400") || err.message.includes("401")) {
                setTemplates([
                    { name: "hello_world", language: "en_US", status: "APPROVED", components: [{ type: "BODY", text: "Hello World! This is a test message." }] },
                    { name: "welcome_offer", language: "en_US", status: "APPROVED", components: [{ type: "BODY", text: "Welcome {{1}}! Enjoy 20% off on your first purchase." }] },
                    { name: "shipping_update", language: "en_US", status: "APPROVED", components: [{ type: "BODY", text: "Hi {{1}}, your order #{{2}} has been shipped!" }] }
                ])
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredTemplates = templates.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search templates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredTemplates.map((template) => (
                        <button
                            key={template.name}
                            onClick={() => {
                                setSelectedId(template.name);
                                onSelect(template);
                            }}
                            className={cn(
                                "flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200",
                                selectedId === template.name
                                    ? "bg-green-500/10 border-green-500/50 shadow-sm shadow-green-900/20"
                                    : "bg-gray-900/30 border-gray-800 hover:bg-gray-800 hover:border-gray-700"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-lg",
                                selectedId === template.name ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-400"
                            )}>
                                <LayoutTemplate className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className={cn("font-medium text-sm", selectedId === template.name ? "text-green-400" : "text-gray-200")}>
                                    {template.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                                    {template.language} • {template.status}
                                </p>
                            </div>
                        </button>
                    ))}
                    {filteredTemplates.length === 0 && !loading && (
                        <p className="text-center text-gray-500 text-sm py-4">No templates found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
