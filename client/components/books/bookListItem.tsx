import { Book } from "@/lib/types/Book";
import Image from "next/image";

export default function BookListItem({ book, onClick }: { book: Book, onClick: () => void }) {
    return (
        <li
            className={`text-slate-200 hover:text-white cursor-pointer m-2 bg-slate-800 border border-slate-700 p-3 rounded-lg flex items-start gap-4 w-full ${book.ImageURL ? "min-h-44 h-44" : ""}`}
            onClick={onClick}
        >
            {book.ImageURL && (
                <div className="h-full w-28 shrink-0 overflow-hidden rounded-md bg-slate-700">
                    <Image
                        className="h-full w-full object-cover"
                        src={book.ImageURL}
                        alt={book.Title}
                        width={112}
                        height={176}
                        unoptimized
                    />
                </div>
            )}
            <div className="flex-1 min-w-0 overflow-y-auto text-left pr-1">
                <h1 className="font-bold break-words">{book.Title}</h1>
                {book.Author && <p className="break-words">Författare: {book.Author}</p>}
                {book.Language && <p className="break-words">Språk: {book.Language}</p>}
            </div>
        </li>
    );
}