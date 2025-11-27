import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp, limit } from "firebase/firestore";

export interface Campaign {
    id?: string;
    templateName: string;
    totalRecipients: number;
    successful: number;
    failed: number;
    status: "completed" | "partial" | "failed";
    createdAt: any; // Timestamp
}

export const saveCampaign = async (campaign: Omit<Campaign, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, "wa_campaign"), {
            ...campaign,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding campaign: ", e);
        throw e;
    }
};

export const getCampaigns = async () => {
    try {
        const q = query(collection(db, "wa_campaign"), orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Campaign[];
    } catch (e) {
        console.error("Error fetching campaigns: ", e);
        return [];
    }
};
