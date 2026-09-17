import { Book } from "@/lib/types/Book";
import Image from "next/image";
import BookStatusBadge from "@/components/books/bookStatusBadge";

export default function BookListItem({ book, onClick, userId }: { book: Book, onClick: () => void, userId?: string | null }) {
    const loanStatus = !book.Borrowed
        ? "available-listItem"
        : book.Current_custody === userId
            ? "borrowed-by-me"
            : "borrowed";

    return (
        <li
            className={`cursor-pointer m-2 flex w-full items-start gap-4 rounded-lg border border-slate-700 bg-slate-800 p-3 text-slate-200 transition duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-slate-700 hover:text-white hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${book.ImageURL ? "min-h-44 h-44" : ""}`}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick();
                }
            }}
            tabIndex={0}
        >
            {book.ImageURL && (
                <div className="relative h-full w-28 shrink-0 overflow-hidden rounded-md bg-slate-700">
                    <Image
                        fill
                        className="h-full w-full object-cover"
                        src={book.ImageURL}
                        alt={book.Title}
                        unoptimized
                    />
                </div>
            )}
            <div className="flex-1 min-w-0 overflow-y-auto text-left pr-1">
                <h1 className="font-bold break-words">{book.Title}</h1>
                <div className="mt-2 flex flex-wrap gap-2">
                    {book.Owner === userId && <BookStatusBadge status="my-book" />}
                    <BookStatusBadge status={loanStatus} />
                </div>
                {book.Language && <p className="break-words">Språk: {book.Language}</p>}
            </div>
        </li>
    );
}