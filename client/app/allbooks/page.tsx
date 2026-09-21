'use client';
import { useEffect, useState } from 'react';
import { getAllBooks, deleteBook, manageBookLoan } from "../../lib/controllers/books.controller";
import BookInfo from "@/components/books/bookinfo";
import BookListItem from "@/components/books/bookListItem";
import BookFilters, { BookFilterValues } from "@/components/books/bookFilters";
import { Book } from "../../lib/types/Book";
import ChangeCustodyForm from "@/components/books/changeCustodyForm";
import { getAllUsers } from "@/lib/controllers/user.controller";
import { PublicUserProfile } from "@/lib/types/Profile";
import { auth } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import LoadingComponent from '@/components/loadingComponent';

export default function AllBooksPage() {
    const [allbooks, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
    const [showChangeCustodyForm, setShowChangeCustodyForm] = useState<Book | null>(null);
    const [filters, setFilters] = useState<BookFilterValues>({
        searchQuery: "",
        language: "",
        owner: "",
        custody: "",
        status: "",
        includeMyBooks: false
    });
    const [users, setUsers] = useState<PublicUserProfile[]>([]);
    const [userId, setUserId] = useState<string | null>(null);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user?.uid || null);
        });

        const fetchBooks = async () => {
            console.log("fetching books...");
            setIsLoading(true);
            const fetchedBooks = await getAllBooks();
            setBooks(fetchedBooks);
            setIsLoading(false);
            console.log("books fetched:", fetchedBooks);
        };

        fetchBooks();

        const fetchUsers = async () => {
            const fetchedUsers = await getAllUsers();
            setUsers(fetchedUsers);
        };

        fetchUsers();

        return () => unsubscribe();
    }, []);

    const filteredBooks = allbooks.filter((book) => {
        const query = filters.searchQuery.trim().toLowerCase();
        const matchesQuery = !query || [book.Title, book.Author, book.Language, book.ISBN]
            .some((value) => value?.toLowerCase().includes(query));
        const matchesLanguage = !filters.language || book.Language === filters.language;
        const matchesOwner = !filters.owner || book.Owner === filters.owner;
        const matchesCustody = !filters.custody || book.Current_custody === filters.custody;
        const matchesStatus = !filters.status
            || (filters.status === "available" && !book.Borrowed)
            || (filters.status === "borrowed" && book.Borrowed);

        const matchesMyBooks = !userId || filters.includeMyBooks || book.Owner !== userId;

        return matchesQuery && matchesLanguage && matchesOwner && matchesCustody && matchesStatus && matchesMyBooks;
    });

    if (isLoading) {
        return <LoadingComponent />;
    }

    return (
        <div className="w-full">
            <BookFilters books={allbooks} users={users} values={filters} onChange={setFilters} />
            <ul className="w-full">
                {filteredBooks.length === 0 ? (
                    <p className="m-4 rounded-lg border border-slate-700 bg-slate-800 p-6 text-center text-slate-400">
                        Inga böcker matchar dina filter.
                    </p>
                ) : filteredBooks.map((book: Book) => (
                    <div key={book.id} className="flex flex-col items-start justify-start bg-slate-800 border border-slate-700 p-4 m-4 rounded-lg">
                        <BookListItem book={book} userId={userId} onClick={() => setSelectedBookId(book.id)}/>

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
                            }}
                            onBookUpdated={(updatedBook) => {
                                setBooks(allbooks.map((item) => item.id === updatedBook.id ? updatedBook : item));
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