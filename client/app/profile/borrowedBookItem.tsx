import UserProfileLink from "@/components/bookinfo/userProfileLink";
import UserInfo from "@/components/userinfo/userinfo";
import { getUserByUid } from "@/lib/controllers/user.controller";
import { PublicUserProfile } from "@/lib/types/Profile";
import { Book } from "@/lib/types/Book";
import { useEffect, useState } from "react";

export default function BorrowedBookItem({ book }: { book: Book }) {
    const [userProfile, setUserProfile] = useState<PublicUserProfile | null>(null);
    const [bookOwnerProfile, setBookOwnerProfile] = useState<PublicUserProfile | null>(null);

    useEffect(() => {
        const fetchBookOwnerProfile = async () => {
            if (!book.Owner) return;
            const ownerData = await getUserByUid(book.Owner);
            setBookOwnerProfile(ownerData || null);
        };

        fetchBookOwnerProfile();
    }, [book.Owner]);

    console.log("Rendering BorrowedBookItem for book:", book);
    return (
        <div className="mt-2 flex row justify-between items-center mb-2">
            <p>{book.Title}</p>
            <p className="text-sm text-gray-600">Lånad från 
                <UserProfileLink user={bookOwnerProfile} onUserProfileLoaded={setUserProfile} />
            </p>
            {userProfile && <UserInfo user={userProfile} onClose={() => setUserProfile(null)} />}
        </div>
    );
}