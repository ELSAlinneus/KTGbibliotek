import { Book } from "@/lib/types/Book";

export default function BookListItem({ book, onClick }: { book: Book, onClick: () => void }) {
    return (
        <li className="text-gray-700 hover:text-gray-900 cursor-pointer m-2 bg-white p-2 rounded-lg flex items-center" onClick={onClick}>
            {book.ImageURL && (
                <img
                    className="h-30 w-24 object-cover inline-block mr-4"
                    src={book.ImageURL}
                    alt={book.Title}
                />
            )}
            <div>
                <h1 className="font-bold">{book.Title}</h1>
                {book.Author && <p>Författare: {book.Author}</p>}
                {book.Language && <p>språk: {book.Language}</p>}
            </div>
        </li>
    );
}