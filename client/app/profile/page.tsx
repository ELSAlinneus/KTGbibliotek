'use client';

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { handleUserProfileChange, handleUserProfilePictureChange, getUserProfilePicture } from "@/lib/controllers/user.controller";
import { getUserBooks } from "@/lib/controllers/user.controller";
import BookInfo from "../../components/bookinfo/bookinfo";
import { Book } from "@/lib/types/Book";
import { PublicUserProfile } from "@/lib/types/Profile";
import { deleteBook, manageBookLoan } from "@/lib/controllers/books.controller";
import ImgUploader from "@/components/imgUploader/imgUploader";
import UploadBookForm from "./uploadBookForm";
import ChangeCustodyForm from "@/components/bookinfo/changeCustodyForm";
import BookStateBtns from "@/components/bookinfo/bookStateBtns";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false); 
    const [profile, setProfile] = useState<PublicUserProfile>({
        displayName: "",
        email: "",
        photoURL: ""
    });
    const [ShowUploadBookForm, setShowUploadBookForm] = useState<boolean>(false);
    const [showChangeCustodyForm, setShowChangeCustodyForm] = useState<string | null>(null);
    const [userBooks, setUserBooks] = useState<Book[]>([]);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
    const selectedBook = userBooks.find((book) => book.id === selectedBookId) || null;

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                const fetchUserBooks = async () => {
                    const books = await getUserBooks();
                    setUserBooks(books);
                };
                fetchUserBooks();

                const fetchUserProfilePicture = async () => {
                    const picture = await getUserProfilePicture(u.uid);
                    setProfile({
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

    return (
        <div className="w-full">
            <div className="p-4 mb-4 w-full bg-gray-200 rounded-lg flex flex-col items-center justify-center">
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
                    className="w-48 h-48 cursor-pointer rounded-full border-2 border-dashed border-gray-300 p-13 text-center hover:border-gray-400"
                />
                <h1 className="text-2xl font-bold text-gray-800 text-center">
                    {profile.displayName || "Användarnamn saknas"}
                </h1>
            </div>
            <div className="p-4 mb-4 ml-10 mr-10 bg-gray-100 rounded-lg">
                <div className="flex row justify-between items-center mb-4">
                    <p className="font-bold">Användaruppgifter</p>
                    <i className="fa fa-pen-to-square" onClick={() => setIsEditing(!isEditing)}></i>
                </div>
                <div className="flex row">
                    <label className="text-gray-700 mr-2">Användarnamn:</label>
                    <input
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                        readOnly={!isEditing}
                        className="text-gray-700 border rounded p-2"
                    />                  
                </div>
                <div className="flex row">
                    <label className="text-gray-700 mr-2">E-post:</label>
                    <input
                        type="text"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        readOnly={!isEditing}
                        className="text-gray-700 border rounded p-2 bg-gray-200"
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
                <div className="p-4 mb-4 ml-10 mr-10 mt-4 bg-gray-100 rounded-lg">
                    <p className="font-bold"> Mina böcker:</p>
                    {userBooks.map((book: Book) => (
                        <div key={book.id} onClick={() => setSelectedBookId(book.id)} className="mt-2 flex row justify-between items-center mb-2">
                            <p>{book.Title}</p>
                            <BookStateBtns 
                            book={book} 
                            onClose={async () => {
                                const deleted = await deleteBook(book.id);
                                if (deleted) {
                                    setUserBooks(userBooks.filter(b => b.id !== book.id));
                                    if (selectedBookId === book.id) {
                                        setSelectedBookId(null);
                                    }
                                }
                            }} 
                            onGetBookBack={async (book) => {
                                const updated = await manageBookLoan(book.id, user.uid, false);
                                if (updated) {
                                    setUserBooks(userBooks.map(b => b.id === book.id ? { ...b, Borrowed: false } : b));
                                }
                            }} onLendBook={async (book) => {
                                setShowChangeCustodyForm(book);
                            }} />
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
                        if (deleted) {
                            setUserBooks(userBooks.filter(b => b.id !== bookId));
                            if (selectedBookId === bookId) {
                                setSelectedBookId(null);
                            }
                        }
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