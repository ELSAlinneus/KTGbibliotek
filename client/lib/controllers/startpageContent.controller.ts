import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export type ContentBlock = {
    id: string;
    title: string;
    text: string;
    image?: string;
    image2?: string;
    imageLayout?: "no" |"large" | "two";
    imageBlob?: Blob;
    imageBlob2?: Blob;
    publishedAt?: string;
    updatedAt?: string;
};

export type HomeContent = {
    welcomeText: string;
    sectionTitle: string;
    blocks: ContentBlock[];
};

const homeContentRef = doc(db, "siteContent", "home");

export async function getHomeContent(): Promise<HomeContent | null> {
    const snapshot = await getDoc(homeContentRef);
    return snapshot.exists() ? (snapshot.data() as HomeContent) : null;
}

export async function saveHomeContent(content: HomeContent): Promise<void> {
    await setDoc(homeContentRef, content);
}
