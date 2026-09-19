import UserProfileLink from "@/components/books/userProfileLink";
import UserInfo from "@/components/profile/userinfo";
import ProfileBookListItem from "@/components/profile/profileBookListItem";
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
        <div>

        <ProfileBookListItem
            book={book}
            onClick={onClick}
            actions={
                <p className="inline-flex max-w-56 items-center gap-1 text-right text-sm text-slate-400">
                    <span className="whitespace-nowrap">Lånad från</span>
                    <UserProfileLink
                        user={bookOwnerProfile}
                        onUserProfileLoaded={setUserProfile}
                        isLoading={isBookOwnerProfileLoading}
                        />
                </p>
            }
            />

            {userProfile && <UserInfo user={userProfile} onClose={() => setUserProfile(null)} />}
            </div>
    );
}