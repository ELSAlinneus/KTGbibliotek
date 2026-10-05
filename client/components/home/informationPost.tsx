import ImgUploader from "@/components/imgUploader/imgUploader";
import type { ContentBlock } from "@/lib/controllers/startpageContent.controller";

type InformationPostProps = {
    block: ContentBlock;
    isEditing: boolean;
    isAdmin: boolean;
    isSaving: boolean;
    onChange: (changes: Partial<ContentBlock>) => void;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onDelete: () => void;
};

function formatDate(value?: string) {
    if (!value) return "";
    return new Intl.DateTimeFormat("sv-SE", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export default function InformationPost({
    block,
    isEditing,
    isAdmin,
    isSaving,
    onChange,
    onEdit,
    onCancel,
    onSave,
    onDelete,
}: InformationPostProps) {
    return (
        <article className="relative rounded-lg border border-slate-700 bg-slate-800 p-6 text-slate-200 shadow-lg">
            {isEditing ? (
                <>
                    <input
                        value={block.title}
                        onChange={(event) => onChange({ title: event.target.value })}
                        placeholder="Rubrik eller titel"
                        className="mb-3 w-full rounded border border-slate-600 bg-slate-900 p-2 font-bold text-slate-100 outline-none focus:border-blue-400"
                        aria-label="Rubrik eller titel"
                    />
                    <textarea
                        value={block.text}
                        onChange={(event) => onChange({ text: event.target.value })}
                        placeholder="Information"
                        className="min-h-28 w-full rounded border border-slate-600 bg-slate-900 p-3 text-slate-100 outline-none focus:border-blue-400"
                        aria-label="Informationstext"
                    />
                    <div className="mt-4">
                        <label className="mb-2 block font-semibold">Bildlayout</label>
                        <select
                            value={block.imageLayout ?? "no"}
                            onChange={(event) => {
                                const imageLayout = event.target.value as "no" | "large" | "two";
                                onChange(imageLayout === "no"
                                    ? { imageLayout, image: "", image2: "", imageBlob: undefined, imageBlob2: undefined }
                                    : { imageLayout });
                            }}
                            className="rounded border border-slate-600 bg-slate-900 p-2 text-slate-100"
                        >
                            <option value="no">Ingen bild</option>
                            <option value="large">En stor bild</option>
                            <option value="two">Två små bilder bredvid varandra</option>
                        </select>
                    </div>
                    {block.imageLayout ===  "no" ? null : (
                        <>
                            <div className={block.imageLayout === "two" ? "mt-4 grid grid-cols-2 gap-4" : "mt-4"}>
                                <div>
                                    <p className="mb-1 text-sm text-slate-300">Bild 1</p>
                                    <ImgUploader
                                        value={block.image}
                                        onChange={(image) =>
                                            onChange(image
                                                ? { image: image.previewUrl, imageBlob: image.blob }
                                                : { image: "", imageBlob: undefined })
                                        }
                                        aspect={block.imageLayout === "two" ? 2 / 3 : 16 / 9}
                                        className={block.imageLayout === "two"
                                            ? "aspect-[2/3] w-full cursor-pointer border-2 border-dashed border-slate-600 p-4 text-center transition hover:border-slate-400"
                                            : "aspect-video w-full cursor-pointer border-2 border-dashed border-slate-600 p-4 text-center transition hover:border-slate-400"}
                                        label="Klicka eller dra hit för att lägga till bild 1"
                                    />
                                </div>
                                {block.imageLayout === "two" && (
                                    <div>
                                        <p className="mb-1 text-sm text-slate-300">Bild 2</p>
                                        <ImgUploader
                                            value={block.image2}
                                            onChange={(image) =>
                                                onChange(image
                                                    ? { image2: image.previewUrl, imageBlob2: image.blob }
                                                    : { image2: "", imageBlob2: undefined })
                                            }
                                            aspect={2 / 3}
                                            className="aspect-[2/3] w-full cursor-pointer border-2 border-dashed border-slate-600 p-4 text-center transition hover:border-slate-400"
                                            label="Klicka eller dra hit för att lägga till bild 2"
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <button type="button" onClick={onDelete} className="text-sm text-red-300 hover:text-red-200">
                            <i className="fa-solid fa-trash mr-2" aria-hidden="true" />
                            Ta bort inlägg
                        </button>
                        <div className="flex gap-3">
                            <button type="button" onClick={onCancel} className="rounded-lg border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-700">
                                Avbryt
                            </button>
                            <button type="button" disabled={isSaving} onClick={onSave} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
                                {isSaving ? "Sparar..." : "Spara"}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {block.title && <h2 className="mb-2 text-xl font-bold">{block.title}</h2>}
                    <p className="whitespace-pre-wrap">{block.text}</p>
                    {(block.image || block.image2) && (
                        <div className={`mt-4 flex gap-4 ${block.imageLayout === "two" ? "flex-row" : ""}`}>
                            {block.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={block.image} alt={block.title || "Bild i informationsinlägg"} className={`${block.imageLayout === "two" ? "w-1/2" : "w-full"} max-h-80 rounded object-cover`} />
                            )}
                            {block.imageLayout === "two" && block.image2 && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={block.image2} alt={block.title || "Bild i informationsinlägg"} className="max-h-80 w-1/2 rounded object-cover" />
                            )}
                        </div>
                    )}
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="absolute right-4 top-4 rounded p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
                            aria-label={`Redigera ${block.title || "inlägget"}`}
                        >
                            <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                        </button>
                    )}
                </>
            )}
            {(block.publishedAt || block.updatedAt) && (
                <div className="mt-5 text-right text-xs text-slate-400">
                    {block.publishedAt && <div>Publicerad: {formatDate(block.publishedAt)}</div>}
                    {block.updatedAt && block.updatedAt !== block.publishedAt && (
                        <div>Senast redigerad: {formatDate(block.updatedAt)}</div>
                    )}
                </div>
            )}
        </article>
    );
}
