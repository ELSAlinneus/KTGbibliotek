import { Book } from "@/lib/types/Book";
import { auth } from "@/lib/firebase/firebase";
import { useEffect, useState } from "react";
import Image from "next/image";
import UserInfo from "../userinfo/userinfo";
import { getUserByUid } from "@/lib/controllers/user.controller";
import { PublicUserProfile } from "@/lib/types/Profile";
import UserProfileLink from "./userProfileLink";

export default function BookInfo({ book, onClose, onDelete }: { book: Book, onClose: () => void, onDelete: (bookId: string) => void }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<PublicUserProfile | null>(null);
    const [ownerDisplayName, setOwnerDisplayName] = useState<string>("");
    const [borrowerDisplayName, setBorrowerDisplayName] = useState<string>("");

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

        async function loadBorrowerDisplayName() {
            if (!book.Current_custody) {
                setBorrowerDisplayName("");
                return;
            }

            const borrowerData = await getUserByUid(book.Current_custody);
            if (isEffectActive) {
                setBorrowerDisplayName(borrowerData?.displayName || book.Current_custody);
            }
        }
        loadBorrowerDisplayName();

        return () => {
            isEffectActive = false;
        };
    }, [book.Owner, book.Current_custody]);

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
                        {book.Owner && userId != book.Owner &&(
                            <p className="text-sm">
                                Boken ägs av{" "}
                                <UserProfileLink
                                    userUid={book.Owner}
                                    onUserProfileLoaded={setUserProfile}
                                    displayName={ownerDisplayName}
                                >
                                </UserProfileLink>
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
                            <div>
                                <div
                                    className="mt-5 inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition"
                                >
                                    Boken är tillgänglig för utlåning
                                </div>
                                <p className="text-sm mt-2">
                                    Om du vill låna boken, kontakta ägaren 
                                    {" "}
                                    <UserProfileLink
                                        userUid={book.Owner}
                                        onUserProfileLoaded={setUserProfile}
                                        displayName={ownerDisplayName}
                                    >
                                    </UserProfileLink>
                                    för att komma överens om utlåning.
                                </p>
                            </div>
                        ) : book.Current_custody === userId ? (
                            <div
                                className="mt-5 inline-flex items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition"
                            >
                                Du har lånat denna bok
                            </div>
                        ) : (
                            <div>
                                <div
                                    className="mt-5 inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition"
                                >
                                    Boken är redan utlånad till 
                                    <UserProfileLink
                                        userUid={book.Current_custody}
                                        onUserProfileLoaded={setUserProfile}
                                        displayName={borrowerDisplayName}
                                    >
                                    </UserProfileLink>
                                </div>
                                <p className="text-sm mt-2">
                                    Du kan kontakta ägaren 
                                    {" "}
                                    <UserProfileLink
                                        userUid={book.Owner}
                                        onUserProfileLoaded={setUserProfile}
                                        displayName={ownerDisplayName}
                                    >
                                    </UserProfileLink>
                                    och/eller lånetagaren {" "} 
                                    <UserProfileLink
                                        userUid={book.Current_custody}
                                        onUserProfileLoaded={setUserProfile}
                                        displayName={borrowerDisplayName}
                                    >
                                    </UserProfileLink>
                                    för att låta dem veta att du är intresserad av att låna boken.
                                </p>                            
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {userProfile && <UserInfo user={userProfile} onClose={() => setUserProfile(null)} />}
        </div>
    );
}