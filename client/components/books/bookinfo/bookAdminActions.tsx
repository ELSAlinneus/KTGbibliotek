type BookAdminActionsProps = {
    isHidden: boolean;
    onDelete: () => void;
    onToggleHidden: () => void;
};

export default function BookAdminActions({
    isHidden,
    onDelete,
    onToggleHidden,
}: BookAdminActionsProps) {
    return (
        <div className="mt-6 border-t border-slate-700 pt-4">
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onDelete}
                    className="rounded bg-red-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                    Radera bok
                </button>
                <button
                    type="button"
                    onClick={onToggleHidden}
                    className="rounded bg-slate-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-500"
                >
                    {isHidden ? "Visa bok" : "Dölj bok"}
                </button>
            </div>
        </div>
    );
}
