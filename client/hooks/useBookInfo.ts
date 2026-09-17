import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { getUserByUid } from "@/lib/controllers/user.controller";
import { updateBookImage, updateBookReadStatus } from "@/lib/controllers/books.controller";
import { Book } from "@/lib/types/Book";
import { PublicUserProfile } from "@/lib/types/Profile";

const EMPTY_READERS: string[] = [];

type ImageChangeResult = { blob: Blob; previewUrl: string } | null;

export function useBookInfo(book: Book, onBookUpdated?: (book: Book) => void) {
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

    const handleImageChange = async (result: ImageChangeResult) => {
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
        await handleImageChange(null);
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
        readerProfiles,
        isUpdatingReadStatus,
        hasRead,
        toggleReadStatus,
        handleImageChange,
        removeBookImage
    };
}