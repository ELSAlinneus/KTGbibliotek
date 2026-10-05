import { ReactNode } from "react";
import BookAdminActions from "./bookAdminActions";

type BookInfoCardProps = {
    title: string;
    onClose: () => void;
    children: ReactNode;
    isAdmin: boolean;
    isHidden?: boolean;
    onDeleteBook: () => void;
    onToggleHidden: () => void;
};

export default function BookInfoCard({
    title,
    onClose,
    children,
    isAdmin,
    isHidden = false,
    onDeleteBook,
    onToggleHidden,
}: BookInfoCardProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className={`w-full max-w-3xl rounded-lg border p-6 text-slate-200 shadow-lg ${isHidden ? "hidden-book-surface border-red-500" : "border-slate-700 bg-slate-800"}`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
                        {isHidden && (
                            <span className="hidden-book-badge rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide">
                                Dold bok
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-300 hover:text-red-400"
                        aria-label="Stäng"
                    >
                        ✕
                    </button>
                </div>
                {children}
                {isAdmin && (
                    <BookAdminActions
                        isHidden={isHidden}
                        onDelete={onDeleteBook}
                        onToggleHidden={onToggleHidden}
                    />
                )}
            </div>
        </div>
    );
}