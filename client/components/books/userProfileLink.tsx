import { PublicUserProfile } from "@/lib/types/Profile";

type UserProfileLinkProps = {
    user?: PublicUserProfile | null;
    onUserProfileLoaded: (user: PublicUserProfile) => void;
    className?: string;
    isLoading?: boolean;
};

export default function UserProfileLink({
    user,
    onUserProfileLoaded,
    className = "cursor-pointer text-current underline underline-offset-2 hover:opacity-80",
    isLoading = false,
}: UserProfileLinkProps) {

    const userUid = user?.userId;
    const displayName = user?.displayName || "Okänd användare";

    if (isLoading) {
        return <span className="animate-pulse text-gray-400 italic">Laddar användare...</span>;
    }

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