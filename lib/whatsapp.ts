import axios from "axios";

const WHATSAPP_API_URL = "https://graph.facebook.com/v17.0";

export const getTemplates = async (accessToken: string, wabaId: string) => {
    try {
        const response = await axios.get(
            `${WHATSAPP_API_URL}/${wabaId}/message_templates`,
            {
                params: {
                    limit: 100,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching templates:", error);
        throw error;
    }
};

export const sendMessage = async (
    accessToken: string,
    phoneNumberId: string,
    to: string,
    templateName: string,
    languageCode: string,
    components: any[] = []
) => {
    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: languageCode,
            },
            components,
        },
    };
    console.log("Final WhatsApp API Payload:", JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post(
            `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error sending message:", error.response?.data || error.message);
        throw error;
    }
};
