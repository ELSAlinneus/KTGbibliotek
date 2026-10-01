import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { getUserByUid } from "@/lib/controllers/user.controller";
import { updateBookBackCoverImage, updateBookImage, updateBookReadStatus } from "@/lib/controllers/books.controller";
import { Book } from "@/lib/types/Book";
import { PublicUserProfile } from "@/lib/types/Profile";

const EMPTY_READERS: string[] = [];

type ImageChangeResult = { blob: Blob; previewUrl: string } | null;
type CoverType = "front" | "back";

export function useBookInfo(book: Book, onBookUpdated?: (book: Book) => void) {
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
    const coverImageConfig = {
        front: {
            field: "ImageURL" as const,
            currentUrl: imageUrl,
            setUrl: setImageUrl,
            updater: updateBookImage,
        },
        back: {
            field: "BackCoverImageURL" as const,
            currentUrl: backCoverImageUrl,
            setUrl: setBackCoverImageUrl,
            updater: updateBookBackCoverImage,
        },
    };

    const updateCover = async (type: CoverType, result: ImageChangeResult) => {
        const { field, currentUrl, setUrl, updater } = coverImageConfig[type];
        const previousUrl = currentUrl;
        setUrl(result?.previewUrl || "");

        try {
            const savedUrl = await updater(book.id, result?.blob);
            setUrl(savedUrl);
            onBookUpdated?.({ ...book, [field]: savedUrl });
        } catch (error) {
            setUrl(previousUrl);
            const message = error instanceof Error ? error.message : "Kunde inte uppdatera bilden.";
            alert(message);
        }
    };

    const removeCover = async (type: CoverType) => {
        if (!window.confirm(`Är du säker på att du vill ta bort omslagsbilden?`)) return;
        await updateCover(type, null);
    };

    const handleImageChange = (result: ImageChangeResult) => updateCover("front", result);
    const handleBackCoverImageChange = (result: ImageChangeResult) => updateCover("back", result);
    const removeBookImage = () => removeCover("front");
    const removeBackCoverImage = () => removeCover("back");
    
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

    return {
        userId,
        userProfile,
        setUserProfile,
        ownerProfile,
        loanedToProfile,
        isOwnerProfileLoading,
        isLoanedToProfileLoading,
        imageUrl,
        backCoverImageUrl,
        readerProfiles,
        isUpdatingReadStatus,
        hasRead,
        toggleReadStatus,
        handleImageChange,
        handleBackCoverImageChange,
        removeBookImage,
        removeBackCoverImage
    };
}