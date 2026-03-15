import { Book } from "@/lib/types/Book";
import { borrowBook } from "../../lib/controllers/books.controller";
import { auth } from "@/lib/firebase/firebase";
import { useEffect, useState } from "react";
import Image from "next/image";
import UserInfo from "../userinfo/userinfo";
import { getUserByUid } from "@/lib/controllers/user.controller";
import { PublicUserProfile } from "@/lib/types/Profile";

export default function BookInfo({ book, onClose, onDelete }: { book: Book, onClose: () => void, onDelete: (bookId: string) => void }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [ownerProfile, setOwnerProfile] = useState<PublicUserProfile | null>(null);
    const [ownerDisplayName, setOwnerDisplayName] = useState<string>("");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUserId(currentUser?.uid || null);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        let isEffectActive = true;

        async function loadOwnerDisplayName() {
            if (!book.Owner) {
                setOwnerDisplayName("");
                return;
            }

            const ownerData = await getUserByUid(book.Owner);
            if (isEffectActive) {
                setOwnerDisplayName(ownerData?.displayName || book.Owner);
            }
        }
        loadOwnerDisplayName();

        return () => {
            isEffectActive = false;
        };
    }, [book.Owner]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
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
                <div className="w-full rounded-xl border border-slate-200 bg-slate-100 p-6 shadow-sm flex items-start gap-6">
                    <div className="h-72 w-48 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-gray-200">
                        {book.ImageURL ? (
                            <Image
                                className="h-full w-full object-cover"
                                src={book.ImageURL}
                                alt={book.Title}
                                width={192}
                                height={288}
                                unoptimized
                            />
                        ) : (
                            <div className="h-full w-full"></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 h-72 overflow-y-auto text-left pr-2 space-y-1 text-slate-700">
                        <h2 className="text-2xl font-semibold text-slate-900 break-words">{book.Title}</h2>
                        {book.Author && <p className="text-sm">Författare: {book.Author}</p>}
                        {book.Year_of_publication && <p className="text-sm">Utgiven: {book.Year_of_publication}</p>}
                        {book.Language && <p className="text-sm">Språk: {book.Language}</p>}
                        {book.Owner && (
                            <p className="text-sm">
                                Boken ägs av{" "}
                                <button
                                    type="button"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const ownerData = await getUserByUid(book.Owner);
                                        if (ownerData) {
                                            setOwnerProfile(ownerData);
                                        }
                                    }}
                                    className="cursor-pointer text-blue-500 hover:text-blue-700"
                                >
                                    {ownerDisplayName}
                                </button>
                            </p>
                        )}
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
            {ownerProfile && <UserInfo user={ownerProfile} onClose={() => setOwnerProfile(null)} />}
        </div>
    );
}