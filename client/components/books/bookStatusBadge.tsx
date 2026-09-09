import { PublicUserProfile } from "@/lib/types/Profile";
import UserProfileLink from "@/components/books/userProfileLink";

type BookStatusBadgeProps = {
    status: "available-listItem" | "available" | "borrowed" | "borrowed-by-me" | "borrowed-by-other" | "i-have-lent-to" | "my-book";
    loanedToProfile?: PublicUserProfile | null;
    onUserProfileLoaded?: (user: PublicUserProfile) => void;
    isLoanedToProfileLoading?: boolean;
};

const statusStyles = {
    "available-listItem": "bg-green-600",
    available: "bg-green-600",
    borrowed: "bg-red-600",
    "borrowed-by-me": "bg-yellow-500",
    "i-have-lent-to": "bg-red-600",
    "borrowed-by-other": "bg-red-600",
    "my-book": "bg-blue-600"
};

export default function BookStatusBadge({ status, loanedToProfile, onUserProfileLoaded, isLoanedToProfileLoading = false }: BookStatusBadgeProps) {
    const content = {
        "available-listItem": "Tillgänglig",
        available: "Boken är tillgänglig för utlåning",
        borrowed: "Utlånad",
        "borrowed-by-me": "Du har lånat denna bok",
        "i-have-lent-to": loanedToProfile ? "Utlånad till" : "Utlånad",
        "borrowed-by-other": loanedToProfile ? "Boken är redan utlånad till" : "Utlånad",
        "my-book": "Min bok"
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
                />
            )}
        </div>
    );
}
