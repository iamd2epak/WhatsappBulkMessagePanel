import { Smartphone } from "lucide-react";

interface PreviewProps {
    template: any;
    variableValues?: Record<string, string>;
}

export default function Preview({ template, variableValues = {} }: PreviewProps) {
    if (!template) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 border border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
                <Smartphone className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Select a template to preview</p>
            </div>
        );
    }

    const bodyComponent = template.components.find((c: any) => c.type === "BODY");
    let text = bodyComponent?.text || "No content";

    // Replace variables with values
    text = text.replace(/{{(\d+)}}/g, (match: string, number: string) => {
        // Try to find a value for "body_X" where X is the number
        const val = variableValues?.[`body_${number}`];
        return val ? `*${val}*` : match;
    });

    // Simple formatter for bold text (*text*)
    const formatText = (inputText: string) => {
        const parts = inputText.split(/(\*[^*]+\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith("*") && part.endsWith("*")) {
                return <strong key={index} className="font-semibold text-white">{part.slice(1, -1)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="relative mx-auto border-gray-800 bg-gray-900 border-[8px] rounded-[2.5rem] h-[500px] w-[280px] shadow-xl flex flex-col overflow-hidden">
            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[10px] top-[72px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[10px] top-[124px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[10px] top-[178px] rounded-l-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[10px] top-[142px] rounded-r-lg"></div>

            <div className="bg-gray-800 w-full h-8 flex items-center justify-center px-4 z-10">
                <div className="w-16 h-4 bg-black rounded-full"></div>
            </div>

            <div className="flex-1 bg-[#0b141a] p-4 overflow-y-auto relative">
                {/* WhatsApp Background Pattern */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}></div>

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="self-start bg-[#202c33] rounded-lg rounded-tl-none p-2 max-w-[85%] shadow-sm">
                        <p className="text-gray-100 text-xs leading-relaxed whitespace-pre-wrap">
                            {formatText(text)}
                        </p>
                        <div className="text-[10px] text-gray-500 text-right mt-1">
                            12:00 PM
                        </div>
                    </div>

                    {/* Render Buttons */}
                    {template.components.find((c: any) => c.type === "BUTTONS")?.buttons?.map((btn: any, i: number) => (
                        <div key={i} className="bg-[#202c33] p-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-[#2a3942] transition-colors shadow-sm mt-1">
                            {btn.type === "FLOW" && <span className="text-[#00a884] text-sm font-medium flex items-center gap-2">⚡ {btn.text}</span>}
                            {btn.type === "URL" && <span className="text-[#53bdeb] text-sm font-medium flex items-center gap-2">🔗 {btn.text}</span>}
                            {btn.type === "PHONE_NUMBER" && <span className="text-[#53bdeb] text-sm font-medium flex items-center gap-2">📞 {btn.text}</span>}
                            {btn.type === "QUICK_REPLY" && <span className="text-[#53bdeb] text-sm font-medium flex items-center gap-2">↩️ {btn.text}</span>}
                            {btn.type === "COPY_CODE" && <span className="text-[#53bdeb] text-sm font-medium flex items-center gap-2">📋 {btn.text}</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
