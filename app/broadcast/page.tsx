"use client";

import { useState, useEffect } from "react";
import CSVUpload from "@/components/CSVUpload";
import TemplateSelector from "@/components/TemplateSelector";
import Preview from "@/components/Preview";
import { Send, Settings, AlertCircle, CheckCircle2, Variable } from "lucide-react";
import { saveCampaign } from "@/lib/db";

export default function BroadcastPage() {
    const [csvData, setCsvData] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [accessToken, setAccessToken] = useState(process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN || "");
    const [wabaId, setWabaId] = useState(process.env.NEXT_PUBLIC_WHATSAPP_WABA_ID || "");
    const [phoneNumberId, setPhoneNumberId] = useState(process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || "");
    const [sending, setSending] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    // Variable Support
    const [templateVariables, setTemplateVariables] = useState<string[]>([]);
    const [variableMapping, setVariableMapping] = useState<Record<string, { type: "custom" | "column"; value: string }>>({});

    // Parse variables when template changes
    useEffect(() => {
        if (selectedTemplate) {
            const vars: string[] = [];
            const initialMapping: any = {};

            // Helper to add variables
            const addVars = (text: string | undefined, prefix: string) => {
                if (!text) return;
                const matches = text.match(/{{(\d+)}}/g);
                if (matches) {
                    const extracted = Array.from(new Set(matches.map((m: string) => m.replace(/{{|}}/g, ""))));
                    extracted.sort((a, b) => parseInt(a) - parseInt(b));
                    extracted.forEach(v => {
                        const key = `${prefix}_${v}`;
                        vars.push(key);
                        initialMapping[key] = { type: "custom", value: "" };
                    });
                }
            };

            // 1. Header Variables
            const header = selectedTemplate.components.find((c: any) => c.type === "HEADER");
            if (header && header.format === "TEXT") {
                addVars(header.text, "header");
            }

            // 2. Body Variables
            const body = selectedTemplate.components.find((c: any) => c.type === "BODY");
            if (body) {
                addVars(body.text, "body");
            }

            // 3. Button Variables (URL)
            const buttons = selectedTemplate.components.find((c: any) => c.type === "BUTTONS");
            if (buttons && buttons.buttons) {
                buttons.buttons.forEach((btn: any, index: number) => {
                    if (btn.type === "URL" && btn.url.includes("{{1}}")) {
                        const key = `button_${index}_1`;
                        vars.push(key);
                        initialMapping[key] = { type: "custom", value: "" };
                    }
                });
            }

            setTemplateVariables(vars);
            setVariableMapping(initialMapping);
        }
    }, [selectedTemplate]);

    const handleBroadcast = async () => {
        console.log("Selected Template Structure:", JSON.stringify(selectedTemplate, null, 2));
        if (!selectedTemplate || csvData.length === 0) return;
        setSending(true);
        setLogs([]);

        let successCount = 0;
        let failedCount = 0;

        for (const row of csvData) {
            if (!row.parsedPhone) continue;

            const components = [];

            // 1. Header Component
            const headerVars = templateVariables.filter(v => v.startsWith("header_"));
            if (headerVars.length > 0) {
                const parameters = headerVars.map(v => {
                    const mapping = variableMapping[v];
                    const val = mapping.type === "custom" ? mapping.value : (row[Object.keys(row).find(k => k.toLowerCase() === mapping.value.toLowerCase()) || ""] || "");
                    return { type: "text", text: String(val ?? "") };
                });
                components.push({ type: "header", parameters });
            }

            // 2. Body Component
            const bodyVars = templateVariables.filter(v => v.startsWith("body_"));
            if (bodyVars.length > 0) {
                const parameters = bodyVars.map(v => {
                    const mapping = variableMapping[v];
                    const val = mapping.type === "custom" ? mapping.value : (row[Object.keys(row).find(k => k.toLowerCase() === mapping.value.toLowerCase()) || ""] || "");
                    return { type: "text", text: String(val ?? "") };
                });
                components.push({ type: "body", parameters });
            }

            // 3. Button Components
            const templateButtons = selectedTemplate.components.find((c: any) => c.type === "BUTTONS");
            if (templateButtons && templateButtons.buttons) {
                templateButtons.buttons.forEach((btn: any, index: number) => {
                    // Handle Dynamic URL Buttons
                    if (btn.type === "URL" && btn.url.includes("{{1}}")) {
                        const key = `button_${index}_1`;
                        const mapping = variableMapping[key];
                        if (mapping) {
                            const val = mapping.type === "custom" ? mapping.value : (row[Object.keys(row).find(k => k.toLowerCase() === mapping.value.toLowerCase()) || ""] || "");
                            components.push({
                                type: "button",
                                sub_type: "url",
                                index: index,
                                parameters: [{ type: "text", text: String(val ?? "") }]
                            });
                        }
                    }

                    // Handle Flow Buttons (Always include if present)
                    if (btn.type === "FLOW") {
                        components.push({
                            type: "button",
                            sub_type: "flow",
                            index: index,
                            parameters: [{
                                type: "action",
                                action: {
                                    flow_token: "unused" // Default token required for Flow buttons
                                }
                            }]
                        });
                    }
                });
            }

            try {
                const res = await fetch("/api/whatsapp/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        accessToken,
                        phoneNumberId,
                        to: "91" + row.parsedPhone,
                        templateName: selectedTemplate.name,
                        languageCode: selectedTemplate.language,
                        components: components
                    }),
                });

                if (res.ok) {
                    setLogs((prev) => [`✅ Sent to ${row.parsedPhone}`, ...prev]);
                    successCount++;
                } else {
                    const errorData = await res.json();
                    const errorMessage = errorData.error?.message || errorData.error || "Unknown error";
                    setLogs((prev) => [`❌ Failed ${row.parsedPhone}: ${errorMessage}`, ...prev]);
                    failedCount++;
                }
            } catch (e) {
                setLogs((prev) => [`❌ Error ${row.parsedPhone}: Network/Server Error`, ...prev]);
                failedCount++;
            }
            // Rate limit delay
            await new Promise((r) => setTimeout(r, 100));
        }

        // Save Campaign History
        try {
            await saveCampaign({
                templateName: selectedTemplate.name,
                totalRecipients: successCount + failedCount,
                successful: successCount,
                failed: failedCount,
                status: "completed",
            });
            setLogs((prev) => [`💾 Campaign saved to history`, ...prev]);
        } catch (e) {
            console.error("Failed to save campaign", e);
            setLogs((prev) => [`⚠️ Failed to save history`, ...prev]);
        }

        setSending(false);
    };

    const csvColumns = csvData.length > 0 ? Object.keys(csvData[0]).filter(k => k !== "parsedPhone") : [];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-24 md:mb-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Broadcast Campaign</h1>
                    <p className="text-gray-400 mt-2">Send bulk messages to your contacts easily.</p>
                </div>
            </div>

            {/* API Configuration Section */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-white font-medium">
                    <Settings className="w-5 h-5 text-gray-400" />
                    API Configuration
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Access Token"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        className="bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-sm text-white w-full"
                    />
                    <input
                        type="text"
                        placeholder="Phone Number ID"
                        value={phoneNumberId}
                        onChange={(e) => setPhoneNumberId(e.target.value)}
                        className="bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-sm text-white w-full"
                    />
                    <input
                        type="text"
                        placeholder="WABA ID"
                        value={wabaId}
                        onChange={(e) => setWabaId(e.target.value)}
                        className="bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-sm text-white w-full"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Enter your WhatsApp Cloud API credentials to fetch templates and send messages.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Step 1: CSV Upload */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center border border-green-500/30">
                                1
                            </span>
                            Upload Contacts
                        </h2>
                        <CSVUpload onDataParsed={setCsvData} />
                    </div>

                    {/* Step 2: Template Selection */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center border border-green-500/30">
                                2
                            </span>
                            Select Template
                        </h2>
                        <TemplateSelector
                            onSelect={setSelectedTemplate}
                            accessToken={accessToken}
                            wabaId={wabaId}
                        />
                    </div>

                    {/* Step 3: Variable Configuration */}
                    {templateVariables.length > 0 && (
                        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center border border-green-500/30">
                                    3
                                </span>
                                Configure Variables
                            </h2>
                            <div className="space-y-4">
                                {templateVariables.map((v) => (
                                    <div key={v} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-gray-800/30 p-4 rounded-xl border border-gray-800">
                                        <div className="flex items-center gap-2 min-w-[100px]">
                                            <div className="w-auto px-3 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-sm">
                                                {v.replace("body_", "Body ").replace("header_", "Header ").replace("button_", "Button ")}
                                            </div>
                                            <span className="text-gray-400 text-sm">Variable</span>
                                        </div>

                                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <select
                                                value={variableMapping[v]?.type}
                                                onChange={(e) => setVariableMapping(prev => ({
                                                    ...prev,
                                                    [v]: { ...prev[v], type: e.target.value as "custom" | "column", value: "" }
                                                }))}
                                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-green-500/50 outline-none"
                                            >
                                                <option value="custom">Custom Text</option>
                                                <option value="column" disabled={csvColumns.length === 0}>CSV Column</option>
                                            </select>

                                            {variableMapping[v]?.type === "custom" ? (
                                                <input
                                                    type="text"
                                                    placeholder="Enter value..."
                                                    value={variableMapping[v]?.value}
                                                    onChange={(e) => setVariableMapping(prev => ({
                                                        ...prev,
                                                        [v]: { ...prev[v], value: e.target.value }
                                                    }))}
                                                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-green-500/50 outline-none w-full"
                                                />
                                            ) : (
                                                <select
                                                    value={variableMapping[v]?.value}
                                                    onChange={(e) => setVariableMapping(prev => ({
                                                        ...prev,
                                                        [v]: { ...prev[v], value: e.target.value }
                                                    }))}
                                                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-green-500/50 outline-none w-full"
                                                >
                                                    <option value="">Select Column</option>
                                                    {csvColumns.map(col => (
                                                        <option key={col} value={col}>{col}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Preview */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 lg:sticky lg:top-6">
                        <h2 className="text-xl font-semibold text-white mb-6 text-center">Preview</h2>
                        <Preview
                            template={selectedTemplate}
                            variableValues={Object.fromEntries(
                                Object.entries(variableMapping).map(([k, v]) => [
                                    k,
                                    v.type === "custom" ? v.value : `[${v.value || "Column"}]`
                                ])
                            )}
                        />

                        <div className="mt-8 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Recipients</span>
                                <span className="text-white font-medium">{csvData.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Template</span>
                                <span className="text-white font-medium truncate max-w-[150px]">
                                    {selectedTemplate?.name || "-"}
                                </span>
                            </div>

                            <button
                                onClick={handleBroadcast}
                                disabled={!selectedTemplate || csvData.length === 0 || sending || !accessToken || !phoneNumberId || (templateVariables.length > 0 && Object.values(variableMapping).some(m => !m.value))}
                                className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    "Sending..."
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Broadcast Now
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Logs */}
                        {logs.length > 0 && (
                            <div className="mt-6 p-4 bg-black rounded-xl border border-gray-800 max-h-40 overflow-y-auto custom-scrollbar">
                                {logs.map((log, i) => (
                                    <div key={i} className="text-xs text-gray-400 font-mono mb-1">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
