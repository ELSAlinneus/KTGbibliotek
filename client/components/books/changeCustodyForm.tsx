import { Book } from "@/lib/types/Book";
import Image from "next/image";
import Searchbar from "@/components/books/searchbar";
import { manageBookLoan } from "@/lib/controllers/books.controller";
import { getAllUsers } from "@/lib/controllers/user.controller";
import { PublicUserProfile } from "@/lib/types/Profile";
import { useEffect, useState } from "react";


export default function ChangeCustodyForm({ book, onClose, onSave }: { book: Book; onClose: () => void; onSave: () => void }) {
    const [users, setUsers] = useState<PublicUserProfile[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    useEffect(() => {
        const fetchUsers = async () => {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
            console.log("fetched users for custody change:", allUsers);
        };
        fetchUsers();
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-3xl rounded-lg border border-slate-700 bg-slate-800 p-6 text-slate-200 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-slate-100">
                            {book.Title}
                        </h1>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="text-slate-300 hover:text-red-400"
                            aria-label="Stäng"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex items-start gap-6">
                            {book.ImageURL && (
                                <div className="h-72 w-48 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-700">
                                        <Image
                                            className="h-full w-full object-cover"
                                            src={book.ImageURL}
                                            alt={book.Title}
                                            width={192}
                                            height={288}
                                            unoptimized
                                        />
                                </div>
                            )}
                        <div>
                            <form className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Till vem vill du låna ut boken?</h2>

                                    {/* TODO: söka på användare, scrolla bland användare*/}
                                    <Searchbar onSearch={(query) => console.log("searching for user with query:", query)} placeholder="Sök användare..." />
                                    <ul className="max-h-48 overflow-y-auto mt-2 rounded border border-slate-600 bg-slate-900">
                                        {users.map((user) => (
                                        user.userId !== book.Owner && (
                                            <li
                                                key={user.userId}
                                                className={`cursor-pointer px-4 py-2 text-slate-200 ${selectedUserId === user.userId ? "bg-slate-700" : "hover:bg-slate-800"}`}
                                                onClick={() => setSelectedUserId(user.userId)}
                                            >
                                                {user.displayName} ({user.email})
                                            </li>
                                        )
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex cursor-pointer items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        const confirmation = window.confirm("Är du säker på att du vill låna ut boken till denna användare?");
                                        if (!confirmation) return;
                                        await manageBookLoan(book.id, selectedUserId, true); 
                                        onSave();  
                                    }}
                                >
                                    Låna ut
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
