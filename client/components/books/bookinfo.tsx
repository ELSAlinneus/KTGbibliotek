import { Book } from "@/lib/types/Book";
import { auth } from "@/lib/firebase/firebase";
import { useEffect, useState } from "react";
import Image from "next/image";
import UserInfo from "@/components/profile/userinfo";
import { getUserByUid } from "@/lib/controllers/user.controller";
import { PublicUserProfile } from "@/lib/types/Profile";
import UserProfileLink from "./userProfileLink";
import BookStateBtns from "@/components/books/bookStateBtns";
import BookStatusBadge from "@/components/books/bookStatusBadge";

export default function BookInfo({ book, onClose, onDelete, onGetBookBack, onLendBook }: { book: Book, onClose: () => void, onDelete: (bookId: string) => void, onGetBookBack: (book: Book) => void, onLendBook: (book: Book) => void }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<PublicUserProfile | null>(null);
    const [ownerProfile, setOwnerProfile] = useState<PublicUserProfile | null>(null);
    const [loanedToProfile, setLoanedToProfile] = useState<PublicUserProfile | null>(null);
    const [isOwnerProfileLoading, setIsOwnerProfileLoading] = useState(false);
    const [isLoanedToProfileLoading, setIsLoanedToProfileLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUserId(currentUser?.uid || null);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        let isEffectActive = true;

        async function loadOwnerProfile() {
            if (!book.Owner) {
                setOwnerProfile(null);
                setIsOwnerProfileLoading(false);
                return;
            }
            setIsOwnerProfileLoading(true);
            const ownerData = await getUserByUid(book.Owner);
            if (isEffectActive) {
                setOwnerProfile(ownerData || null);
                setIsOwnerProfileLoading(false);
            }
        }
        loadOwnerProfile();

        async function loadLoanedToProfile() {
            if (!book.Current_custody) {
                setLoanedToProfile(null);
                setIsLoanedToProfileLoading(false);
                return;
            }
            setIsLoanedToProfileLoading(true);
            const loanedToUser = await getUserByUid(book.Current_custody);
            if (isEffectActive) {
                setLoanedToProfile(loanedToUser || null);
                setIsLoanedToProfileLoading(false);
            }
        }
        loadLoanedToProfile();

        return () => {
            isEffectActive = false;
        };
    }, [book.Owner, book.Current_custody]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
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
                                    user={ownerProfile}
                                    onUserProfileLoaded={setUserProfile}
                                    isLoading={isOwnerProfileLoading}
                                />
                            </p>
                        )}
                        {userId === book.Owner ? (
                            <div>
                                <p className="mt-4 text-sm text-red-600 font-bold">Detta är din bok</p>
                                <BookStateBtns book={book} 
                                loanedToProfile={loanedToProfile}
                                onUserProfileLoaded={setUserProfile}
                                isLoanedToProfileLoading={isLoanedToProfileLoading}
                                onDelete={() => {onDelete(book.id)}} 
                                onGetBookBack={() => {onGetBookBack(book)}} 
                                onLendBook={() => {onLendBook(book)}} />
                            </div>
                        ) : !book.Borrowed ? (
                            <div>
                                <div className="mt-5">
                                    <BookStatusBadge status="available" />
                                </div>
                                <p className="text-sm mt-2">
                                    Om du vill låna boken, kontakta ägaren{" "}
                                    <UserProfileLink
                                        user={ownerProfile}
                                        onUserProfileLoaded={setUserProfile}
                                        isLoading={isOwnerProfileLoading}
                                    />
                                    {" "}för att komma överens om utlåning.
                                </p>
                            </div>
                        ) : book.Current_custody === userId ? (
                            <div className="mt-5">
                                <BookStatusBadge status="borrowed-by-me" />
                            </div>
                        ) : (
                            <div>
                                <div className="mt-5">
                                    <BookStatusBadge
                                        status="borrowed-by-other"
                                        loanedToProfile={loanedToProfile}
                                        onUserProfileLoaded={setUserProfile}
                                        isLoanedToProfileLoading={isLoanedToProfileLoading}
                                    />
                                </div>
                                <p className="text-sm mt-2">
                                    Du kan kontakta ägaren{" "}
                                    <UserProfileLink
                                        user={ownerProfile}
                                        onUserProfileLoaded={setUserProfile}
                                        isLoading={isOwnerProfileLoading}
                                    />
                                    {" "}och/eller lånetagaren{" "}
                                    <UserProfileLink
                                        user={loanedToProfile}
                                        onUserProfileLoaded={setUserProfile}
                                        isLoading={isLoanedToProfileLoading}
                                    />
                                    {" "}för att låta dem veta att du är intresserad av att låna boken.
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