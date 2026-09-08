import { Book } from "@/lib/types/Book";

export default function BookStateBtns({ book, onDelete, onGetBookBack, onLendBook }: { book: Book; onDelete: () => void;  onGetBookBack: (book: Book) => void; onLendBook: (book: Book) => void }) {
    return (
        <div className="flex row justify-end items-center">
            {book.Borrowed ? (
                <div className="flex row justify-end items-center">
                    <div className="mr-2 p-1 bg-yellow-500 text-white rounded transition duration-300 shadow">
                        Utlånad
                    </div>
                    <button className="mr-2 p-1 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300 shadow"
                    onClick={(e) => {
                        e.stopPropagation();
                        const confirmBookBack = window.confirm("Är du säker på att har fått tillbaka denna bok?");
                        if(!confirmBookBack) return;
                        onGetBookBack(book);
                    }}>
                        Fått tillbaka
                    </button>
                </div>
            ):(
                <button className="mr-2 p-1 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300 shadow"
                onClick={(e) => {
                    e.stopPropagation();
                    onLendBook(book);
                }}>
                    Låna ut
                </button>
            )}
            <button className="p-1 bg-gray-600 text-white rounded hover:bg-red-700 transition duration-300 shadow"
            onClick={async (e) => {
                e.stopPropagation();
                onDelete();
            }}> 
                Ta bort
            </button>
        </div>
    );
}