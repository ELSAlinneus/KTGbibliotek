import { PublicUserProfile } from "@/lib/types/Profile";
import UserProfileLink from "@/components/books/userProfileLink";

type BookStatusBadgeProps = {
    status: "available" | "borrowed-by-me" | "borrowed-by-other" | "i-have-lent-to";
    loanedToProfile?: PublicUserProfile | null;
    onUserProfileLoaded?: (user: PublicUserProfile) => void;
    isLoanedToProfileLoading?: boolean;
};

const statusStyles = {
    available: "bg-green-600",
    "borrowed-by-me": "bg-yellow-500",
    "i-have-lent-to": "bg-yellow-500",
    "borrowed-by-other": "bg-red-600"
};

export default function BookStatusBadge({ status, loanedToProfile, onUserProfileLoaded, isLoanedToProfileLoading = false }: BookStatusBadgeProps) {
    const content = {
        available: "Boken är tillgänglig för utlåning",
        "borrowed-by-me": "Du har lånat denna bok",
        "i-have-lent-to": "Utlånad till",
        "borrowed-by-other": "Boken är redan utlånad till"
    }[status];

    return (
        <div className={`inline-flex items-center gap-1 p-1 text-white rounded transition duration-300 shadow ${statusStyles[status]}`}>
            <span>{content}</span>
            {(status === "i-have-lent-to" || status === "borrowed-by-other") && isLoanedToProfileLoading && (
                <span className="text-gray-200 italic">Laddar användare...</span>
            )}
            {(status === "i-have-lent-to" || status === "borrowed-by-other") && !isLoanedToProfileLoading && loanedToProfile && onUserProfileLoaded && (
                <UserProfileLink
                    user={loanedToProfile}
                    onUserProfileLoaded={onUserProfileLoaded}
                    className="text-white underline hover:text-gray-100"
                />
            )}
        </div>
    );
}
