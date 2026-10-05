"use client";

import AdminInfoBadge from "@/components/home/adminInfoBadge";
import InformationPost from "@/components/home/informationPost";
import WelcomeSection from "@/components/home/welcomeSection";
import SectionHeading from "@/components/home/sectionHeading";
import { useHomePage } from "@/hooks/useHomePage";

export default function HomePage() {
    const {
        content, sortedBlocks, isAdmin, editingId, showAdminBadge, isLoading, isSaving, error,
        setContent, setShowAdminBadge, updateBlock, startEditing, cancelEditing,
        saveContent, addBlock, deleteBlock,
    } = useHomePage();

    if (isLoading) {
        return <div className="w-full p-8 text-slate-300">Laddar startsidan...</div>;
    }

    return (
        <div className="w-full space-y-4 p-8">
            {isAdmin && showAdminBadge && (
                <AdminInfoBadge onClose={() => setShowAdminBadge(false)} />
            )}

            {error && <p className="rounded-lg bg-red-950/60 p-3 text-red-200">{error}</p>}

            <WelcomeSection
                text={content.welcomeText}
                isEditing={editingId === "welcome"}
                isAdmin={isAdmin}
                isSaving={isSaving}
                onChange={(welcomeText) => setContent((current) => ({ ...current, welcomeText }))}
                onEdit={() => startEditing("welcome")}
                onCancel={cancelEditing}
                onSave={saveContent}
            />

            <SectionHeading
                title={content.sectionTitle}
                isEditing={editingId === "section"}
                isAdmin={isAdmin}
                isSaving={isSaving}
                onChange={(sectionTitle) => setContent((current) => ({ ...current, sectionTitle }))}
                onEdit={() => startEditing("section")}
                onCancel={cancelEditing}
                onSave={saveContent}
            />

            {sortedBlocks.map((block) => (
                <InformationPost
                    key={block.id}
                    block={block}
                    isEditing={editingId === block.id}
                    isAdmin={isAdmin}
                    isSaving={isSaving}
                    onChange={(changes) => updateBlock(block.id, changes)}
                    onEdit={() => startEditing(block.id)}
                    onCancel={cancelEditing}
                    onSave={saveContent}
                    onDelete={() => deleteBlock(block.id)}
                />
            ))}

            {isAdmin && (
                <button
                    type="button"
                    disabled={editingId !== null}
                    onClick={addBlock}
                    className="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-600 py-4 text-slate-300 hover:border-blue-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <i className="fa-solid fa-plus mr-2" aria-hidden="true" />
                    Lägg till inlägg
                </button>
            )}
        </div>
    );
}
