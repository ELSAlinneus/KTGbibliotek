'use client';
import { useEffect, useState } from 'react';
import { getAllBooks, deleteBook, manageBookLoan } from "../../lib/controllers/books.controller";
import BookInfo from "../../components/bookinfo/bookinfo";
import BookListItem from "../../components/bookinfo/bookListItem";
import Searchbar from "../../components/bookinfo/searchbar";
import { Book } from "../../lib/types/Book";
import ChangeCustodyForm from "@/components/bookinfo/changeCustodyForm";

export default function AllBooksPage() {
    const [allbooks, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
    const [showChangeCustodyForm, setShowChangeCustodyForm] = useState<Book | null>(null);


    useEffect(() => {
        const fetchBooks = async () => {
            console.log("fetching books...");
            setIsLoading(true);
            const fetchedBooks = await getAllBooks();
            setBooks(fetchedBooks);
            setIsLoading(false);
            console.log("books fetched:", fetchedBooks);
        };

        fetchBooks();

    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full">
            <div className="p-4 mb-4 w-full bg-gray-200 rounded-lg">
                <h1 className="text-2xl font-bold text-gray-800 text-center">
                    Alla Böcker
                </h1>
            </div>
            <Searchbar onSearch={(query) => console.log(query)} placeholder="Hitta böcker..." />
            <ul className="w-full">
                {allbooks.map((book: Book) => (
                    <div key={book.id} className="flex flex-col items-start justify-start bg-gray-100 p-4 m-4 rounded-lg">
                        <BookListItem book={book} onClick={() => setSelectedBookId(book.id)}/>

                        {selectedBookId === book.id && (
                            <BookInfo book={book} onClose={() => setSelectedBookId(null)} 
                            onDelete={async (bookId) => {
                                const deleted = await deleteBook(bookId);
                                if (deleted) {
                                    setBooks(allbooks.filter(b => b.id !== bookId));
                                }
                            }}
                            onGetBookBack={async (book) => {
                                const updated = await manageBookLoan(book.id, book.Owner, false);
                                if (updated) {
                                    setBooks(allbooks.map(b => b.id === book.id ? { ...b, Borrowed: false, Current_custody: book.Owner } : b));
                                }
                            }}
                            onLendBook={async (book) => {
                                setShowChangeCustodyForm(book);
                            }} />
                        )}
                    </div>
                ))}
            </ul>
            {showChangeCustodyForm && (
                <ChangeCustodyForm book={showChangeCustodyForm} onClose={() => setShowChangeCustodyForm(null)} 
                onSave={() => {
                    setBooks(allbooks.map(b => b.id === showChangeCustodyForm.id ? { ...b, Borrowed: true } : b));
                    setShowChangeCustodyForm(null);
                }} />
            )}
        </div>
    );
}