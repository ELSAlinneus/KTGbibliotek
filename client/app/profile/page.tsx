'use client';

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { handleUserProfileChange, handleUserProfilePictureChange, getUserProfilePicture } from "@/lib/controllers/user.controller";
import NewBookForm  from "./newBookForm";
import { getUserBooks } from "@/lib/controllers/user.controller";
import BookInfo from "../../components/bookinfo/bookinfo";
import { Book } from "@/lib/types/Book";
import { Profile } from "@/lib/types/Profile";
import { deleteBook } from "@/lib/controllers/books.controller";
import ImgUploader from "@/components/imgUploader";
import UploadBook from "./uploadBook";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false); 
    const [profile, setProfile] = useState<Profile>({
        username: "",
        email: "",
        picture: ""
    });
    const [showNewBookForm, setShowNewBookForm] = useState<boolean>(false);
    const [userBooks, setUserBooks] = useState<Book[]>([]);
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

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
                        username: u.displayName || "",
                        email: u.email || "",
                        picture: picture || ""
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
                    value={profile.picture}
                    onChange={(result) => {
                        if (result) {
                            const updatedProfile = { ...profile, picture: result.previewUrl };
                            setProfile(updatedProfile);
                            handleUserProfilePictureChange(updatedProfile, result.blob);
                        } else {
                            const updatedProfile = { ...profile, picture: "" };
                            setProfile(updatedProfile);
                            handleUserProfilePictureChange(updatedProfile);
                        }
                    }}
                    round={true}
                    className="w-48 h-48 cursor-pointer rounded-full border-2 border-dashed border-gray-300 p-13 text-center hover:border-gray-400"
                />
                <h1 className="text-2xl font-bold text-gray-800 text-center">
                    {profile.username}
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
                        value={profile.username}
                        onChange={(e) => setProfile({...profile, username: e.target.value})}
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
                    <button onClick={() => handleUserProfileChange(profile)} className="mt-2 ml-2 p-2 bg-blue-500 text-white rounded">
                        Uppdatera användaruppgifter
                    </button>
                )}
            </div>

            <div >
                <button className="ml-10 p-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300 shadow"
                    onClick={() => setShowNewBookForm(!showNewBookForm)}>
                    Ladda upp ny bok till biblioteket
                </button>
                {showNewBookForm && (
                    <NewBookForm 
                        user={user} 
                        onClose={() => setShowNewBookForm(false)}
                        onBookAdded={(newBook) => {
                            setUserBooks([...userBooks, newBook]);
                        }}
                    />
                )}
                {/* TODO */}
                <UploadBook />
            </div>
            {userBooks.length > 0 && (
                <div className="p-4 mb-4 ml-10 mr-10 mt-4 bg-gray-100 rounded-lg">
                    <p className="font-bold"> Mina böcker:</p>
                    {userBooks.map((book: Book) => (
                        <div key={book.id} onClick={() => setSelectedBookId(book.id)} className="mt-2 flex row justify-between items-center mb-2">
                            <p>{book.Title}</p>
                            <div>
                                <button className="mr-2 p-1 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300 shadow">
                                    Redigera
                                </button>
                                <button className="p-1 bg-gray-600 text-white rounded hover:bg-red-700 transition duration-300 shadow"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const deleted = await deleteBook(book.id);
                                    if (deleted) {
                                        setUserBooks(userBooks.filter(b => b.id !== book.id));
                                        if (selectedBookId === book.id) {
                                            setSelectedBookId(null);
                                        }
                                    }
                                }}> 
                                    Ta bort
                                </button>
                            </div>
                            {selectedBookId === book.id && (
                                <BookInfo 
                                book={book} 
                                onClose={() => setSelectedBookId(null)} 
                                onDelete={async (bookId) => {
                                    const deleted = await deleteBook(bookId);
                                    if (deleted) {
                                        setUserBooks(userBooks.filter(b => b.id !== bookId));
                                        if (selectedBookId === bookId) {
                                            setSelectedBookId(null);
                                        }
                                    }
                                }} /> 
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}