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
    const [userSearchQuery, setUserSearchQuery] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
            console.log("fetched users for custody change:", allUsers);
        };
        fetchUsers();
    }, []);

    const availableUsers = users.filter((user) => user.userId !== book.Owner);
    const normalizedSearchQuery = userSearchQuery.trim().toLocaleLowerCase();
    const filteredUsers = availableUsers.filter((user) =>
        [user.displayName, user.email ?? ""].some((value) =>
            value.toLocaleLowerCase().includes(normalizedSearchQuery)
        )
    );

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
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <h2 className="text-xl font-bold mb-4">Till vem vill du låna ut boken?</h2>

                                        <Searchbar onSearch={setUserSearchQuery} placeholder="Sök användare..." />
                                        <ul className="mt-2 max-h-40 overflow-y-auto rounded border border-slate-600 bg-slate-900">
                                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                                <li
                                                    key={user.userId}
                                                    className={`cursor-pointer px-4 py-2 text-slate-200 ${selectedUserId === user.userId ? "bg-slate-700" : "hover:bg-slate-800"}`}
                                                    onClick={() => setSelectedUserId(user.userId)}
                                                >
                                                    {user.displayName} {user.email && `(${user.email})`}
                                                </li>
                                            )) : (
                                                <li className="px-4 py-2 text-slate-500">Ingen användare hittades.</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold mb-4">Har personen inget konto?</h2>
                                        <p className="mb-2">Om personen inte har ett konto kan du be dem skapa ett konto först. När de har skapat ett konto kan du låna ut boken till dem.</p>
                                    </div>
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
