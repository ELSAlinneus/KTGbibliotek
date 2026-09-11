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
import ImgUploader from "@/components/imgUploader/imgUploader";
import { updateBookImage, updateBookReadStatus } from "@/lib/controllers/books.controller";

const EMPTY_READERS: string[] = [];

export default function BookInfo({ book, onClose, onDelete, onGetBookBack, onLendBook, onBookUpdated }: { book: Book, onClose: () => void, onDelete: (bookId: string) => void, onGetBookBack: (book: Book) => void, onLendBook: (book: Book) => void, onBookUpdated?: (book: Book) => void }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<PublicUserProfile | null>(null);
    const [ownerProfile, setOwnerProfile] = useState<PublicUserProfile | null>(null);
    const [loanedToProfile, setLoanedToProfile] = useState<PublicUserProfile | null>(null);
    const [isOwnerProfileLoading, setIsOwnerProfileLoading] = useState(false);
    const [isLoanedToProfileLoading, setIsLoanedToProfileLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(book.ImageURL || "");
    const [readerProfiles, setReaderProfiles] = useState<PublicUserProfile[]>([]);
    const [isUpdatingReadStatus, setIsUpdatingReadStatus] = useState(false);
    const readers = book.Readers ?? EMPTY_READERS;
    const hasRead = userId ? readers.includes(userId) : false;

    const toggleReadStatus = async () => {
        if (!userId || isUpdatingReadStatus) return;

        setIsUpdatingReadStatus(true);
        const nextHasRead = !hasRead;
        const updated = await updateBookReadStatus(book.id, userId, nextHasRead);
        if (updated) {
            onBookUpdated?.({
                ...book,
                Readers: nextHasRead
                    ? [...readers, userId]
                    : readers.filter((readerId) => readerId !== userId)
            });
        } else {
            alert("Kunde inte uppdatera lässtatusen.");
        }
        setIsUpdatingReadStatus(false);
    };

    const handleImageChange = async (result: { blob: Blob; previewUrl: string } | null) => {
        const previousImageUrl = imageUrl;
        setImageUrl(result?.previewUrl || "");

        try {
            const savedImageUrl = await updateBookImage(book.id, result?.blob);
            setImageUrl(savedImageUrl);
            onBookUpdated?.({ ...book, ImageURL: savedImageUrl });
        } catch (error) {
            setImageUrl(previousImageUrl);
            const message = error instanceof Error ? error.message : "Kunde inte uppdatera bilden.";
            alert(message);
        }
    };

    const removeBookImage = async () => {
        const confirmRemove = window.confirm("Är du säker på att du vill ta bort omslagsbilden?");
        if (!confirmRemove) return;
        handleImageChange(null);
    }

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

    useEffect(() => {
        let isEffectActive = true;

        Promise.all(readers.map((readerId) => getUserByUid(readerId))).then((profiles) => {
            if (isEffectActive) {
                setReaderProfiles(profiles.filter((profile): profile is PublicUserProfile => Boolean(profile)));
            }
        });

        return () => {
            isEffectActive = false;
        };
    }, [readers]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-3xl rounded-lg border border-slate-700 bg-slate-800 p-6 text-slate-200 shadow-lg" onClick={(e) => e.stopPropagation()}>
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
                <div className="relative w-full rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm flex items-start gap-6">
                    {userId && (
                        <label className="absolute right-5 top-4 flex max-w-[45%] items-center gap-2 text-right text-sm font-medium text-slate-200">
                            <input
                                type="checkbox"
                                id="readStatus"
                                checked={hasRead}
                                onChange={toggleReadStatus}
                                disabled={!userId || isUpdatingReadStatus}
                                className="h-4 w-4 shrink-0 rounded border border-slate-600 appearance-none checked:appearance-auto bg-transparent accent-slate-700 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <span>{isUpdatingReadStatus ? "Sparar..." : "Jag har läst denna bok"}</span>
                        </label>
                    )}
                    <div className="relative h-72 w-48 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-700">
                        {imageUrl ? (
                            <Image
                                className="h-full w-full object-cover"
                                src={imageUrl}
                                alt={book.Title}
                                width={192}
                                height={288}
                                unoptimized
                            />
                        ) : (
                            <div className="h-full w-full"></div>
                        )}
                        {userId === book.Owner && imageUrl && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center ">
                                <ImgUploader
                                    value=""
                                    onChange={handleImageChange}
                                    label="Byt omslagsbild"
                                    aspect={2 / 3}
                                    className="absolute left-2 top-2 cursor-pointer rounded-lg border border-white/25 bg-slate-950/85 px-2 py-1 text-center text-sm text-white shadow-lg transition hover:border-white/50 hover:bg-slate-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-white/70"
                                />
                                <button
                                    type="button"
                                    onClick={removeBookImage}
                                    className="absolute right-2 top-2 rounded-full border border-white/20 bg-slate-950/85 px-2 py-1 text-sm font-medium text-white shadow-lg transition hover:border-white/50 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                                    aria-label="Ta bort omslagsbild"
                                >
                                    ✕
                                </button>
                            </div>
                        )} : {(userId === book.Owner && !imageUrl) && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 border-2 border-dashed border-white/70 rounded-lg">
                                <ImgUploader
                                    value=""
                                    onChange={handleImageChange}
                                    label="Lägg till omslagsbild"
                                    aspect={2 / 3}
                                    className="flex h-full w-full items-center justify-center px-3 py-2 text-center text-sm text-white transition "
                                />
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex-1 min-w-0 h-72 overflow-y-auto text-left pr-2 space-y-1 text-slate-300">
                        {book.Author && <p className="text-sm">Författare: {book.Author}</p>}
                        {book.Year_of_publication && <p className="text-sm">Utgiven: {book.Year_of_publication}</p>}
                        {book.Language && <p className="text-sm">Språk: {book.Language}</p>}
                        {readerProfiles.length > 0 && (
                            <p className="mt-2 text-sm text-slate-300">
                                Läst av: {readerProfiles.map((profile, index) => (
                                    <span key={profile.userId}>
                                        <UserProfileLink
                                            user={profile}
                                            onUserProfileLoaded={setUserProfile}
                                        />
                                        {index < readerProfiles.length - 1 && ", "}
                                    </span>
                                ))}
                            </p>
                        )}
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
                                <div className="mt-2">
                                    <BookStatusBadge status="my-book" />
                                </div>
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