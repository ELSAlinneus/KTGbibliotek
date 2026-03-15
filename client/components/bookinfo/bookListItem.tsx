import { Book } from "@/lib/types/Book";
import Image from "next/image";

export default function BookListItem({ book, onClick }: { book: Book, onClick: () => void }) {
    return (
        <li
            className="text-gray-700 hover:text-gray-900 cursor-pointer m-2 bg-white p-3 rounded-lg flex items-start gap-4 min-h-44 h-44 w-full"
            onClick={onClick}
        >
            <div className="h-full w-28 shrink-0 overflow-hidden rounded-md bg-gray-200">
                {book.ImageURL ? (
                    <Image
                        className="h-full w-full object-cover"
                        src={book.ImageURL}
                        alt={book.Title}
                        width={112}
                        height={176}
                        unoptimized
                    />
                ) : null}
            </div>
            <div className="flex-1 min-w-0 h-full overflow-y-auto text-left pr-1">
                <h1 className="font-bold break-words">{book.Title}</h1>
                {book.Author && <p className="break-words">Författare: {book.Author}</p>}
                {book.Language && <p className="break-words">Språk: {book.Language}</p>}
            </div>
        </li>
    );
}