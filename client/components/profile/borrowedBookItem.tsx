import UserProfileLink from "@/components/books/userProfileLink";
import UserInfo from "@/components/profile/userinfo";
import { getUserByUid } from "@/lib/controllers/user.controller";
import { PublicUserProfile } from "@/lib/types/Profile";
import { Book } from "@/lib/types/Book";
import { useEffect, useState } from "react";

export default function BorrowedBookItem({ book, onClick }: { book: Book; onClick: () => void }) {
    const [userProfile, setUserProfile] = useState<PublicUserProfile | null>(null);
    const [bookOwnerProfile, setBookOwnerProfile] = useState<PublicUserProfile | null>(null);
    const [isBookOwnerProfileLoading, setIsBookOwnerProfileLoading] = useState(true);

    useEffect(() => {
        const fetchBookOwnerProfile = async () => {
            if (!book.Owner) {
                setIsBookOwnerProfileLoading(false);
                return;
            }
            setIsBookOwnerProfileLoading(true);
            const ownerData = await getUserByUid(book.Owner);
            setBookOwnerProfile(ownerData || null);
            setIsBookOwnerProfileLoading(false);
        };

        fetchBookOwnerProfile();
    }, [book.Owner]);

    return (
        <div className="mt-2 flex row justify-between items-center mb-2 bg-slate-700 border border-slate-600 rounded-lg p-2 cursor-pointer hover:bg-slate-600 transition duration-300" onClick={onClick}>
            <p>{book.Title}</p>
            <p className="inline-flex items-center gap-1 text-sm text-slate-400">
                <span>Lånad från</span>
                <UserProfileLink
                    user={bookOwnerProfile}
                    onUserProfileLoaded={setUserProfile}
                    isLoading={isBookOwnerProfileLoading}
                />
            </p>
            {userProfile && <UserInfo user={userProfile} onClose={() => setUserProfile(null)} />}
        </div>
    );
}