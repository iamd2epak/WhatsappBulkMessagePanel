import { NextResponse } from "next/server";
import { getTemplates } from "@/lib/whatsapp";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("accessToken");
    const wabaId = searchParams.get("wabaId");

    if (!accessToken || !wabaId) {
        return NextResponse.json(
            { error: "Missing accessToken or wabaId" },
            { status: 400 }
        );
    }

    try {
        const data = await getTemplates(accessToken, wabaId);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch templates" },
            { status: 500 }
        );
    }
}
