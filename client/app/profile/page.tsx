'use client';

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { handleUserProfileChange, handleUserProfilePictureChange, getUserProfilePicture, getUserBooks, getUserBorrowedBooks } from "@/lib/controllers/user.controller";
import BookInfo from "@/components/books/bookinfo";
import { Book } from "@/lib/types/Book";
import { PublicUserProfile } from "@/lib/types/Profile";
import { deleteBook, getAllBooks, manageBookLoan } from "@/lib/controllers/books.controller";
import ImgUploader from "@/components/imgUploader/imgUploader";
import UploadBookForm from "@/components/profile/uploadBookForm";
import ChangeCustodyForm from "@/components/books/changeCustodyForm";
import BookStateBtns from "@/components/books/bookStateBtns";
import BorrowedBookItem from "@/components/profile/borrowedBookItem";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false); 
    const [profile, setProfile] = useState<PublicUserProfile>({
        userId: "",
        displayName: "",
        email: "",
        photoURL: ""
    });
    const [ShowUploadBookForm, setShowUploadBookForm] = useState<boolean>(false);
    const [showChangeCustodyForm, setShowChangeCustodyForm] = useState<Book | null>(null);
    const [userBooks, setUserBooks] = useState<Book[]>([]);
    const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
    const [readBooks, setReadBooks] = useState<Book[]>([]);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
    const selectedBook = [...userBooks, ...borrowedBooks, ...readBooks].find((book) => book.id === selectedBookId) || null;

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                const fetchUserBooks = async () => {
                    const books = await getUserBooks();
                    setUserBooks(books);
                };
                fetchUserBooks();

                const fetchBorrowedBooks = async () => {
                    const books = await getUserBorrowedBooks();
                    setBorrowedBooks(books);
                };
                fetchBorrowedBooks();

                const fetchReadBooks = async () => {
                    //TODO borde denna logik ligga här? eller books.controller.ts? Eller kanske i user.controller.ts?
                    const books = await getAllBooks();
                    const readBooks = books.filter(book => book.Readers?.includes(u.uid));
                    setReadBooks(readBooks);
                }
                fetchReadBooks();

                const fetchUserProfilePicture = async () => {
                    const picture = await getUserProfilePicture(u.uid);
                    setProfile({
                        userId: u.uid,
                        displayName: u.displayName || "",
                        email: u.email || "",
                        photoURL: picture || ""
                    });
                };
                fetchUserProfilePicture();
            }
        });
        return () => unsub();
    }, []);

    function handleBookDeleted(bookId: string) {
        setUserBooks(userBooks.filter(b => b.id !== bookId));
        setReadBooks(readBooks.filter(b => b.id !== bookId));
        if (selectedBookId === bookId) {
            setSelectedBookId(null);
        }
    }

    const handleGetBookBack = async (book: Book) => {
        if (!user) return;

        const updated = await manageBookLoan(book.id, user.uid, false);
        if (updated) {
            setUserBooks(userBooks.map(b => b.id === book.id ? { ...b, Borrowed: false } : b));
            setBorrowedBooks(borrowedBooks.filter(b => b.id !== book.id));
            setSelectedBookId(null);
        }
    }

    return (
        <div className="w-full">
            <div className=" p-4 m-4 bg-slate-800 border border-slate-700 rounded-lg flex flex-col items-center justify-center">
                <ImgUploader
                    value={profile.photoURL}
                    onChange={(result) => {
                        if (result) {
                            const updatedProfile = { ...profile, photoURL: result.previewUrl };
                            setProfile(updatedProfile);
                            handleUserProfilePictureChange(updatedProfile, result.blob);
                        } else {
                            const updatedProfile = { ...profile, photoURL: "" };
                            setProfile(updatedProfile);
                            handleUserProfilePictureChange(updatedProfile);
                        }
                    }}
                    round={true}
                    className="w-48 h-48 cursor-pointer rounded-full border-2 border-dashed border-slate-600 p-13 text-center hover:border-slate-400"
                />
                <h1 className="text-2xl font-bold text-slate-100 text-center">
                    {profile.displayName || "Användarnamn saknas"}
                </h1>
            </div>
            <div className="p-4 mb-4 ml-10 mr-10 bg-slate-800 border border-slate-700 rounded-lg">
                <div className="flex row justify-between items-center mb-4">
                    <p className="font-bold">Användaruppgifter</p>
                    <i className="fa fa-pen-to-square" onClick={() => setIsEditing(!isEditing)}></i>
                </div>
                <div className="flex row mb-4">
                    <label className="text-slate-300 mr-2">Användarnamn:</label>
                    <input
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                        readOnly={!isEditing}
                        className="text-slate-100 bg-slate-900 border border-slate-600 rounded p-2"
                    />                  
                </div>
                <div className="flex row">
                    <label className="text-slate-300 mr-2">E-post:</label>
                    <input
                        type="text"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        readOnly={!isEditing}
                        className="text-slate-400 border border-slate-600 rounded p-2 bg-slate-700"
                    />
                </div>
                {isEditing && (
                    <button onClick={async () => {
                        try {
                            await handleUserProfileChange(profile);
                        } catch (error) {
                            const message = error instanceof Error ? error.message : "Ett fel uppstod vid uppdatering.";
                            alert(message);
                        }
                    }} className="mt-2 ml-2 p-2 bg-blue-500 text-white rounded">
                        Uppdatera användaruppgifter
                    </button>
                )}
            </div>

            <div >
                <button className="ml-10 p-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300 shadow"
                    onClick={() => setShowUploadBookForm(!ShowUploadBookForm)}>
                    Ladda upp ny bok till biblioteket
                </button>
                {ShowUploadBookForm && (
                    <UploadBookForm 
                        user={user} 
                        onClose={() => setShowUploadBookForm(false)}
                        onBookAdded={(newBook) => {
                            setUserBooks([...userBooks, newBook]);
                        }}
                    />
                )}
            </div>
            {userBooks.length > 0 && (
                <div className="p-4 mb-4 ml-10 mr-10 mt-4 bg-slate-800 border border-slate-700 rounded-lg">
                    <p className="font-bold"> Mina böcker:</p>
                    {userBooks.map((book: Book) => (
                        <div key={book.id} onClick={() => setSelectedBookId(book.id)} className="mt-2 flex row justify-between items-center mb-2 bg-slate-700 border border-slate-600 rounded-lg p-2 cursor-pointer hover:bg-slate-600 transition duration-300">
                            <p>{book.Title}</p>
                            <BookStateBtns 
                            book={book} 
                            onDelete={async () => {
                                const deleted = await deleteBook(book.id);
                                if(deleted) handleBookDeleted(book.id);
                            } }
                            onGetBookBack={handleGetBookBack} 
                            onLendBook={async (book) => {
                                setShowChangeCustodyForm(book);
                            }} />
                        </div>
                    ))}
                </div>
            )}
            {borrowedBooks.length > 0 && (
                <div className="p-4 mb-4 ml-10 mr-10 mt-4 bg-slate-800 border border-slate-700 rounded-lg">
                    <p className="font-bold"> Lånade böcker:</p>
                    {borrowedBooks.map((book: Book) => (
                        <BorrowedBookItem key={book.id} book={book} onClick={() => setSelectedBookId(book.id)} />
                    ))}
                </div>
            )}
            {readBooks.length > 0 && (
                <div className="p-4 mb-4 ml-10 mr-10 mt-4 bg-slate-800 border border-slate-700 rounded-lg">
                    <p className="font-bold"> Lästa böcker:</p>
                    {readBooks.map((book: Book) => (
                        <div key={book.id} onClick={() => setSelectedBookId(book.id)} className="mt-2 flex row justify-between items-center mb-2 bg-slate-700 border border-slate-600 rounded-lg p-2 cursor-pointer hover:bg-slate-600 transition duration-300">
                            <p>{book.Title}</p>
                        </div>
                    ))}
                </div>
            )}
            {selectedBook && (
                <BookInfo 
                    book={selectedBook} 
                    onClose={() => setSelectedBookId(null)} 
                    onDelete={async (bookId) => {
                        const deleted = await deleteBook(bookId);
                        if(deleted) handleBookDeleted(bookId);
                    }}
                    onGetBookBack={handleGetBookBack} 
                    onLendBook={async (book: Book) => {
                        setShowChangeCustodyForm(book);
                    }}
                    onBookUpdated={(updatedBook) => {
                        setUserBooks(userBooks.map((item) => item.id === updatedBook.id ? updatedBook : item));
                        setBorrowedBooks(borrowedBooks.map((item) => item.id === updatedBook.id ? updatedBook : item));
                        setReadBooks(readBooks.map((item) => item.id === updatedBook.id ? updatedBook : item));
                    }}
                />
            )}
            {showChangeCustodyForm && (
                <ChangeCustodyForm book={showChangeCustodyForm} onClose={() => setShowChangeCustodyForm(null)} 
                onSave={() => {
                    setUserBooks(userBooks.map(b => b.id === showChangeCustodyForm.id ? { ...b, Borrowed: true } : b));
                    setShowChangeCustodyForm(null);
                }} />
            )}
        </div>
    );
}