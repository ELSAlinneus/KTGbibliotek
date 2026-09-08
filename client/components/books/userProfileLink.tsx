import { PublicUserProfile } from "@/lib/types/Profile";

type UserProfileLinkProps = {
    user?: PublicUserProfile | null;
    onUserProfileLoaded: (user: PublicUserProfile) => void;
    className?: string;
};

export default function UserProfileLink({
    user,
    onUserProfileLoaded,
    className = "cursor-pointer text-blue-500 hover:text-blue-700",
}: UserProfileLinkProps) {

    const userUid = user?.userId;
    const displayName = user?.displayName || "Okänd användare";

    return (
        <button
            type="button"
            onClick={async (e) => {
                e.stopPropagation();
                if (!userUid) return;
                if (user) {
                    onUserProfileLoaded(user);
                }
            }}
            className={className}
        >
            {displayName}
        </button>
    );
}