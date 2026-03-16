import { getUserByUid } from "@/lib/controllers/user.controller";
import { PublicUserProfile } from "@/lib/types/Profile";

type UserProfileLinkProps = {
    userUid?: string | null;
    displayName?: string;
    onUserProfileLoaded: (user: PublicUserProfile) => void;
    className?: string;
};

export default function UserProfileLink({
    userUid,
    displayName,
    onUserProfileLoaded,
    className = "cursor-pointer text-blue-500 hover:text-blue-700",
}: UserProfileLinkProps) {
    return (
        <button
            type="button"
            onClick={async (e) => {
                e.stopPropagation();
                if (!userUid) return;
                const userData = await getUserByUid(userUid);
                if (userData) {
                    onUserProfileLoaded(userData);
                }
            }}
            className={className}
        >
            {displayName || "okänd användare"}
        </button>
    );
}