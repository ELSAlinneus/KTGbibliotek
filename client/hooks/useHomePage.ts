import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import {
    getHomeContent,
    saveHomeContent,
    type ContentBlock,
    type HomeContent,
} from "@/lib/controllers/startpageContent.controller";

const defaultContent: HomeContent = {
    welcomeText:
        "Välkommen till KTG Bibliotek! Här kan du utforska och låna böcker från vårt samlade bibliotek. Logga in för att få tillgång till ditt personliga bibliotekskonto, där du dessutom kan ladda upp egna böcker som andra kan få låna av dig.",
    sectionTitle: "KTG Tipsar:",
    blocks: [],
};

function createBlock(): ContentBlock {
    return { id: crypto.randomUUID(), title: "", text: "" };
}

function cloneContent(content: HomeContent): HomeContent {
    return {
        welcomeText: content.welcomeText,
        sectionTitle: content.sectionTitle,
        blocks: content.blocks.map((block) => ({ ...block })),
    };
}

async function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Kunde inte läsa bilden."));
        reader.readAsDataURL(blob);
    });
}

export function useHomePage() {
    const [content, setContent] = useState<HomeContent>(defaultContent);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingSnapshot, setEditingSnapshot] = useState<HomeContent | null>(null);
    const [showAdminBadge, setShowAdminBadge] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                const admin = user
                    ? (await user.getIdTokenResult(true)).claims.admin === true
                    : false;
                const storedContent = await getHomeContent();
                if (active) {
                    setIsAdmin(admin);
                    if (storedContent) {
                        setContent({
                            ...defaultContent,
                            ...storedContent,
                            blocks: (storedContent.blocks ?? []).map((block) => ({
                                ...block,
                                imageLayout: block.imageLayout ?? "no",
                            })),
                        });
                    }
                    setIsLoading(false);
                }
            } catch (loadError) {
                console.error("Kunde inte läsa startsidans innehåll:", loadError);
                if (active) {
                    setError("Kunde inte läsa startsidans innehåll.");
                    setIsLoading(false);
                }
            }
        });

        return () => {
            active = false;
            unsubscribe();
        };
    }, []);

    const updateBlock = (id: string, changes: Partial<ContentBlock>) => {
        setContent((current) => ({
            ...current,
            blocks: current.blocks.map((block) =>
                block.id === id ? { ...block, ...changes } : block
            ),
        }));
    };

    const startEditing = (id: string) => {
        setEditingSnapshot(cloneContent(content));
        setEditingId(id);
    };

    const cancelEditing = () => {
        if (editingSnapshot) setContent(editingSnapshot);
        setEditingSnapshot(null);
        setEditingId(null);
    };

    const saveContent = async () => {
        setIsSaving(true);
        setError("");
        try {
            const blocks = await Promise.all(
                content.blocks.map(async ({
                    imageBlob,
                    imageBlob2,
                    publishedAt: existingPublishedAt,
                    updatedAt: existingUpdatedAt,
                    imageLayout,
                    ...block
                }) => {
                    const isPostBeingSaved = editingId === block.id;
                    const timestamp = isPostBeingSaved ? new Date().toISOString() : undefined;
                    const publishedAt = existingPublishedAt ?? (isPostBeingSaved ? timestamp : undefined);
                    const savedBlock: ContentBlock = {
                        ...block,
                        image: imageBlob ? await blobToDataUrl(imageBlob) : block.image ?? "",
                        image2: imageBlob2 ? await blobToDataUrl(imageBlob2) : block.image2 ?? "",
                    };
                    if (imageLayout) savedBlock.imageLayout = imageLayout;
                    if (publishedAt) savedBlock.publishedAt = publishedAt;
                    const updatedAt = isPostBeingSaved && existingPublishedAt ? timestamp : existingUpdatedAt;
                    if (updatedAt) savedBlock.updatedAt = updatedAt;
                    return savedBlock;
                })
            );
            await saveHomeContent({
                welcomeText: content.welcomeText,
                sectionTitle: content.sectionTitle,
                blocks,
            });
            setContent((current) => ({ ...current, blocks }));
            setEditingSnapshot(null);
            setEditingId(null);
        } catch (saveError) {
            console.error("Kunde inte spara startsidans innehåll:", saveError);
            setError("Kunde inte spara ändringarna. Försök igen.");
        } finally {
            setIsSaving(false);
        }
    };

    const addBlock = () => {
        const block = createBlock();
        setEditingSnapshot(cloneContent(content));
        setContent((current) => ({ ...current, blocks: [...current.blocks, block] }));
        setEditingId(block.id);
    };

    const deleteBlock = (id: string) => {
        setContent((current) => ({
            ...current,
            blocks: current.blocks.filter((block) => block.id !== id),
        }));
    };

    const sortedBlocks = [...content.blocks].sort((a, b) => {
        const getTimestamp = (block: ContentBlock) =>
            Date.parse(block.updatedAt ?? block.publishedAt ?? "") || 0;
        return getTimestamp(b) - getTimestamp(a);
    });

    return {
        content,
        sortedBlocks,
        isAdmin,
        editingId,
        showAdminBadge,
        isLoading,
        isSaving,
        error,
        setContent,
        setShowAdminBadge,
        updateBlock,
        startEditing,
        cancelEditing,
        saveContent,
        addBlock,
        deleteBlock,
    };
}
