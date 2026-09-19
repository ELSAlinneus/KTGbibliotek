import { Book } from "@/lib/types/Book";
import { auth } from "@/lib/firebase/firebase";
import { useEffect, useState } from "react";
import UserInfo from "@/components/profile/userinfo";
import { getUserByUid } from "@/lib/controllers/user.controller";
import { PublicUserProfile } from "@/lib/types/Profile";
import { updateBookBackCoverImage, updateBookImage, updateBookReadStatus } from "@/lib/controllers/books.controller";
import BookInfoCard from "./bookinfo/bookInfoCard";
import BookInfoDetails from "./bookinfo/bookInfoDetails";
import BookInfoImages from "./bookinfo/bookInfoImages";

const EMPTY_READERS: string[] = [];

export default function BookInfo({ book, onClose, onDelete, onGetBookBack, onLendBook, onBookUpdated }: { book: Book, onClose: () => void, onDelete: (bookId: string) => void, onGetBookBack: (book: Book) => void, onLendBook: (book: Book) => void, onBookUpdated?: (book: Book) => void }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<PublicUserProfile | null>(null);
    const [ownerProfile, setOwnerProfile] = useState<PublicUserProfile | null>(null);
    const [loanedToProfile, setLoanedToProfile] = useState<PublicUserProfile | null>(null);
    const [isOwnerProfileLoading, setIsOwnerProfileLoading] = useState(false);
    const [isLoanedToProfileLoading, setIsLoanedToProfileLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(book.ImageURL || "");
    const [backCoverImageUrl, setBackCoverImageUrl] = useState(book.BackCoverImageURL || "");
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

    const handleBackCoverImageChange = async (result: { blob: Blob; previewUrl: string } | null) => {
        const previousBackCoverImageUrl = backCoverImageUrl;
        setBackCoverImageUrl(result?.previewUrl || "");

        try {
            const savedImageUrl = await updateBookBackCoverImage(book.id, result?.blob);
            setBackCoverImageUrl(savedImageUrl);
            onBookUpdated?.({ ...book, BackCoverImageURL: savedImageUrl });
        } catch (error) {
            setBackCoverImageUrl(previousBackCoverImageUrl);
            const message = error instanceof Error ? error.message : "Kunde inte uppdatera bilden.";
            alert(message);
        }
    };

    const removeBookImage = async () => {
        const confirmRemove = window.confirm("Är du säker på att du vill ta bort omslagsbilden?");
        if (!confirmRemove) return;
        handleImageChange(null);
    }

    const removeBackCoverImage = async () => {
        const confirmRemove = window.confirm("Är du säker på att du vill ta bort baksidesbilden?");
        if (!confirmRemove) return;
        handleBackCoverImageChange(null);
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

    const isOwner = userId === book.Owner;

    return (
        <BookInfoCard title={book.Title} onClose={onClose}>
            <div className="relative flex w-full flex-wrap items-start gap-6 rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                {userId && (
                    <label className="absolute right-5 top-4 flex max-w-[45%] items-center gap-2 text-right text-sm font-medium text-slate-200">
                        <input
                            type="checkbox"
                            id="readStatus"
                            checked={hasRead}
                            onChange={toggleReadStatus}
                            disabled={isUpdatingReadStatus}
                            className="h-4 w-4 shrink-0 rounded border border-slate-600 appearance-none checked:appearance-auto bg-transparent accent-slate-700 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span>{isUpdatingReadStatus ? "Sparar..." : "Jag har läst denna bok"}</span>
                    </label>
                )}
                <BookInfoImages
                    title={book.Title}
                    imageUrl={imageUrl}
                    backCoverImageUrl={backCoverImageUrl}
                    isOwner={isOwner}
                    onImageChange={handleImageChange}
                    onBackCoverImageChange={handleBackCoverImageChange}
                    onRemoveImage={removeBookImage}
                    onRemoveBackCoverImage={removeBackCoverImage}
                />
                <BookInfoDetails
                    book={book}
                    userId={userId}
                    readerProfiles={readerProfiles}
                    ownerProfile={ownerProfile}
                    loanedToProfile={loanedToProfile}
                    isOwnerProfileLoading={isOwnerProfileLoading}
                    isLoanedToProfileLoading={isLoanedToProfileLoading}
                    onUserProfileLoaded={setUserProfile}
                    onDelete={() => onDelete(book.id)}
                    onGetBookBack={() => onGetBookBack(book)}
                    onLendBook={() => onLendBook(book)}
                />
            </div>
            {userProfile && <UserInfo user={userProfile} onClose={() => setUserProfile(null)} />}
        </BookInfoCard>
    );
}