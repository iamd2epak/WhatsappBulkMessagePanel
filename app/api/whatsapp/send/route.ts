import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Sending WhatsApp Message Payload:", JSON.stringify(body, null, 2));
        const { accessToken, phoneNumberId, to, templateName, languageCode, components } = body;

        if (!accessToken || !phoneNumberId || !to || !templateName || !languageCode) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const data = await sendMessage(
            accessToken,
            phoneNumberId,
            to,
            templateName,
            languageCode,
            components
        );
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to send message" },
            { status: 500 }
        );
    }
}
