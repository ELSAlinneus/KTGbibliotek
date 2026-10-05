type SectionHeadingProps = {
    title: string;
    isEditing: boolean;
    isAdmin: boolean;
    isSaving: boolean;
    onChange: (title: string) => void;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
};

export default function SectionHeading({
    title,
    isEditing,
    isAdmin,
    isSaving,
    onChange,
    onEdit,
    onCancel,
    onSave,
}: SectionHeadingProps) {
    return (
        <div className="relative">
            {isEditing ? (
                <div className="flex items-center gap-3">
                    <input
                        value={title}
                        onChange={(event) => onChange(event.target.value)}
                        className="w-full rounded border border-slate-600 bg-slate-900 p-2 text-2xl font-bold text-slate-100"
                        aria-label="Rubrik för inlägg"
                    />
                    <button type="button" onClick={onCancel} className="rounded-lg border border-slate-600 px-3 py-2 text-slate-200 hover:bg-slate-700">
                        Avbryt
                    </button>
                    <button type="button" disabled={isSaving} onClick={onSave} className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
                        {isSaving ? "Sparar..." : "Spara"}
                    </button>
                </div>
            ) : (
                <h1 className="text-2xl font-bold text-slate-200 mt-8 mb-4">
                    {title}
                    {isAdmin && (
                        <button type="button" onClick={onEdit} className="ml-2 rounded p-2 text-base text-slate-300 hover:bg-slate-700 hover:text-white" aria-label="Redigera rubriken">
                            <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                        </button>
                    )}
                </h1>
            )}
        </div>
    );
}
