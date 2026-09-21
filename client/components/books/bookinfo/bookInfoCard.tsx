import { ReactNode } from "react";

type BookInfoCardProps = {
    title: string;
    onClose: () => void;
    children: ReactNode;
};

export default function BookInfoCard({ title, onClose, children }: BookInfoCardProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="w-full max-w-3xl rounded-lg border border-slate-700 bg-slate-800 p-6 text-slate-200 shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
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
            </div>
        </div>
    );
}