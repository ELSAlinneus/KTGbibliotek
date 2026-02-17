import { Book } from "@/lib/types/Book";
import { borrowBook } from "../../lib/controllers/books.controller";
import { auth } from "@/lib/firebase/firebase";
import { useEffect, useState } from "react";

export default function BookInfo({ book, onClose, onDelete }: { book: Book, onClose: () => void, onDelete: (bookId: string) => void }) {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUserId(currentUser?.uid || null);
        });
        return unsubscribe;
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {book.Title}
                    </h1>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="text-black hover:text-red-800 "
                        aria-label="Stäng"
                    >
                        ✕
                    </button>
                </div>
                <div className="mx-auto w-full max-w-xl rounded-xl border border-slate-200 bg-slate-100 p-6 shadow-sm flex flex-row items-start justify-between ">
                    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 ml-8 ">
                        {book.ImageURL ? (
                            <img
                                className="h-64 w-full object-cover"
                                src={book.ImageURL}
                                alt={book.Title}
                            />
                        ) : (
                            <div className="h-64 w-full bg-gray-200"></div>
                        )}
                    </div>
                    <div className="mt-10 space-y-1 text-slate-700 mr-25">
                        <h1 className="text-2xl font-semibold text-slate-900">{book.Title}</h1>
                        {book.Author && <p className="text-sm">Författare: {book.Author}</p>}
                        {book.Year_of_publication && <p className="text-sm">Utgiven: {book.Year_of_publication}</p>}
                        {book.Language && <p className="text-sm">Språk: {book.Language}</p>}
                        {book.Owner && <p className="text-sm">Boken ägs av {book.Owner}</p>}
                        {userId === book.Owner ? (
                            <div>
                                <p className="mt-4 text-sm text-red-600 font-bold">Detta är din bok</p>
                                <button
                                    className="mt-5 inline-flex items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-600  cursor-pointer"
                                >
                                    Redigera
                                </button>
                                <button
                                    onClick={() => onDelete(book.id)}
                                    className="mt-5 inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600  cursor-pointer ml-2"
                                >
                                    Ta bort
                                </button>
                            </div>
                        ) : !book.Borrowed ? (
                            <button
                                onClick={borrowBook}
                                className="mt-5 inline-flex items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-600  cursor-pointer"
                            >
                                Låna
                            </button>
                        ) : (
                            <p className="mt-4 text-sm text-red-600 font-bold">Boken är redan utlånad</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}