type WelcomeSectionProps = {
    text: string;
    isEditing: boolean;
    isAdmin: boolean;
    isSaving: boolean;
    onChange: (text: string) => void;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
};

export default function WelcomeSection({
    text,
    isEditing,
    isAdmin,
    isSaving,
    onChange,
    onEdit,
    onCancel,
    onSave,
}: WelcomeSectionProps) {
    return (
        <section className="relative rounded-lg border border-slate-700 bg-slate-800 p-6 text-slate-200 shadow-lg mt-2 mb-16">
            {isEditing ? (
                <textarea
                    value={text}
                    onChange={(event) => onChange(event.target.value)}
                    className="min-h-32 w-full rounded border border-slate-600 bg-slate-900 p-3 text-slate-100 outline-none focus:border-blue-400"
                    aria-label="Välkomsttext"
                />
            ) : (
                <p className="whitespace-pre-wrap">{text}</p>
            )}
            {isAdmin && !isEditing && (
                <button
                    type="button"
                    onClick={onEdit}
                    className="absolute right-4 top-4 rounded p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
                    aria-label="Redigera välkomsttexten"
                >
                    <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                </button>
            )}
            {isAdmin && isEditing && (
                <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={onCancel} className="rounded-lg border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-700">
                        Avbryt
                    </button>
                    <button type="button" disabled={isSaving} onClick={onSave} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60">
                        {isSaving ? "Sparar..." : "Spara"}
                    </button>
                </div>
            )}
        </section>
    );
}
