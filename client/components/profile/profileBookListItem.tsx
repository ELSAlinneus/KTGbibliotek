import { ReactNode } from "react";
import { Book } from "@/lib/types/Book";

type ProfileBookListItemProps = {
    book: Book;
    onClick: () => void;
    actions?: ReactNode;
};

export default function ProfileBookListItem({ book, onClick, actions }: ProfileBookListItemProps) {
    return (
        <div
            onClick={onClick}
            className="flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-lg border border-slate-600 bg-slate-700 p-2 transition duration-300 hover:bg-slate-600"
        >
            <p className="min-w-0 flex-1 break-words text-left">{book.Title}</p>
            {actions && <div className="shrink-0">{actions}</div>}
        </div>
    );
}
