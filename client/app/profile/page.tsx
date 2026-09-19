'use client';

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { handleUserProfileChange, handleUserProfilePictureChange, getUserByUid, getUserBooks, getUserBorrowedBooks } from "@/lib/controllers/user.controller";
import BookInfo from "@/components/books/bookinfo";
import { Book } from "@/lib/types/Book";
import { PublicUserProfile } from "@/lib/types/Profile";
import { deleteBook, getAllBooks, manageBookLoan } from "@/lib/controllers/books.controller";
import UploadBookForm from "@/components/profile/uploadBookForm";
import ChangeCustodyForm from "@/components/books/changeCustodyForm";
import BorrowedBookItem from "@/components/profile/borrowedBookItem";
import OwnedBookItem from "@/components/profile/ownedBookItem";
import ProfileBookListItem from "@/components/profile/profileBookListItem";
import ProfileBookSection from "@/components/profile/profileBookSection";
import ProfileDetails from "@/components/profile/profileDetails";
import ProfileHeader from "@/components/profile/profileHeader";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<PublicUserProfile>({ userId: "", displayName: "", email: "", photoURL: "" });
    const [showUploadBookForm, setShowUploadBookForm] = useState(false);
    const [showChangeCustodyForm, setShowChangeCustodyForm] = useState<Book | null>(null);
    const [userBooks, setUserBooks] = useState<Book[]>([]);
    const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
    const [readBooks, setReadBooks] = useState<Book[]>([]);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
    const selectedBook = [...userBooks, ...borrowedBooks, ...readBooks].find((book) => book.id === selectedBookId) || null;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) return;

            getUserBooks().then(setUserBooks);
            getUserBorrowedBooks().then(setBorrowedBooks);
            getAllBooks().then((books) => setReadBooks(books.filter((book) => book.Readers?.includes(currentUser.uid))));
            getUserByUid(currentUser.uid).then((userProfile) => setProfile(userProfile || {
                userId: currentUser.uid,
                displayName: currentUser.displayName || "",
                email: currentUser.email || "",
                photoURL: "",
                bio: "",
                phone: ""
            }));
        });
        return () => unsubscribe();
    }, []);

    function handleBookDeleted(bookId: string) {
        setUserBooks((books) => books.filter((book) => book.id !== bookId));
        setReadBooks((books) => books.filter((book) => book.id !== bookId));
        if (selectedBookId === bookId) setSelectedBookId(null);
    }

    const handleGetBookBack = async (book: Book) => {
        if (!user) return;
        const updated = await manageBookLoan(book.id, user.uid, false);
        if (!updated) return;
        setUserBooks((books) => books.map((item) => item.id === book.id ? { ...item, Borrowed: false } : item));
        setBorrowedBooks((books) => books.filter((item) => item.id !== book.id));
        setSelectedBookId(null);
    };

    return (
        <div className="w-full">
            <ProfileHeader
                profile={profile}
                onPhotoChange={async (result) => {
                    const updatedProfile = { ...profile, photoURL: result?.previewUrl || "" };
                    const changed = await handleUserProfilePictureChange(updatedProfile, result?.blob);
                    if (changed) setProfile(updatedProfile);
                }}
            />
            <ProfileDetails
                profile={profile}
                isEditing={isEditing}
                onEditingChange={setIsEditing}
                onProfileChange={setProfile}
                onSave={async () => {
                    try {
                        await handleUserProfileChange(profile);
                    } catch (error) {
                        const message = error instanceof Error ? error.message : "Ett fel uppstod vid uppdatering.";
                        alert(message);
                    }
                    setIsEditing(false);
                }}
            />
            <div>
                <button type="button" className="ml-10 rounded bg-gray-500 p-2 text-white shadow transition duration-300 hover:bg-gray-700" onClick={() => setShowUploadBookForm(!showUploadBookForm)}>
                    Ladda upp ny bok till biblioteket
                </button>
                {showUploadBookForm && <UploadBookForm user={user} onClose={() => setShowUploadBookForm(false)} onBookAdded={(book) => setUserBooks((books) => [...books, book])} />}
            </div>

            {userBooks.length > 0 && (
                <ProfileBookSection title="Mina böcker:">
                    {userBooks.map((book) => <OwnedBookItem  key={book.id} book={book} onClick={() => setSelectedBookId(book.id)} onDelete={async () => { if (await deleteBook(book.id)) handleBookDeleted(book.id); }} onGetBookBack={handleGetBookBack} onLendBook={async (bookToLend) => setShowChangeCustodyForm(bookToLend)} /> )}
                </ProfileBookSection>
            )}

            {borrowedBooks.length > 0 && (
                <ProfileBookSection title="Lånade böcker:">
                    {borrowedBooks.map((book) => <BorrowedBookItem  key={book.id}  book={book} onClick={() => setSelectedBookId(book.id)} /> )}
                </ProfileBookSection>
            )}

            {readBooks.length > 0 && (
                <ProfileBookSection title="Lästa böcker:">
                    {readBooks.map((book) => <ProfileBookListItem key={book.id} book={book} onClick={() => setSelectedBookId(book.id)} /> )}
                </ProfileBookSection>
            )}

            {selectedBook && <BookInfo 
                book={selectedBook} 
                onClose={() => setSelectedBookId(null)} 
                onDelete={async (bookId) => { if (await deleteBook(bookId)) handleBookDeleted(bookId); }} 
                onGetBookBack={handleGetBookBack} 
                onLendBook={async (book) => setShowChangeCustodyForm(book)} 
                onBookUpdated={(updatedBook) => {
                    setUserBooks((books) => books.map((item) => item.id === updatedBook.id ? updatedBook : item));
                    setBorrowedBooks((books) => books.map((item) => item.id === updatedBook.id ? updatedBook : item));
                    setReadBooks((books) => books.map((item) => item.id === updatedBook.id ? updatedBook : item));
                }} />
            }

            {showChangeCustodyForm && <ChangeCustodyForm book={showChangeCustodyForm} onClose={() => setShowChangeCustodyForm(null)} onSave={() => {
                setUserBooks((books) => books.map((book) => book.id === showChangeCustodyForm.id ? { ...book, Borrowed: true } : book));
                setShowChangeCustodyForm(null);
            }} />}
        </div>
    );
}
