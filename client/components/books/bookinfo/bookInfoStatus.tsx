import BookStateBtns from "@/components/books/bookStateBtns";
import BookStatusBadge from "@/components/books/bookStatusBadge";
import UserProfileLink from "@/components/books/userProfileLink";
import { Book } from "@/lib/types/Book";
import { PublicUserProfile } from "@/lib/types/Profile";

type BookInfoStatusProps = {
    book: Book;
    userId: string | null;
    ownerProfile: PublicUserProfile | null;
    loanedToProfile: PublicUserProfile | null;
    isOwnerProfileLoading: boolean;
    isLoanedToProfileLoading: boolean;
    onUserProfileLoaded: (user: PublicUserProfile) => void;
    onDelete: () => void;
    onGetBookBack: () => void;
    onLendBook: () => void;
};

export default function BookInfoStatus({
    book,
    userId,
    ownerProfile,
    loanedToProfile,
    isOwnerProfileLoading,
    isLoanedToProfileLoading,
    onUserProfileLoaded,
    onDelete,
    onGetBookBack,
    onLendBook,
}: BookInfoStatusProps) {
    const ownerLink = (
        <UserProfileLink user={ownerProfile} onUserProfileLoaded={onUserProfileLoaded} isLoading={isOwnerProfileLoading} />
    );

    if (userId === book.Owner) {
        return (
            <div>
                <div className="mt-2"><BookStatusBadge status="my-book" /></div>
                <BookStateBtns
                    book={book}
                    loanedToProfile={loanedToProfile}
                    onUserProfileLoaded={onUserProfileLoaded}
                    isLoanedToProfileLoading={isLoanedToProfileLoading}
                    onDelete={onDelete}
                    onGetBookBack={onGetBookBack}
                    onLendBook={onLendBook}
                />
            </div>
        );
    }

    if (!book.Borrowed) {
        return (
            <div>
                <div className="mt-5"><BookStatusBadge status="available" /></div>
                <p className="mt-2 text-sm">Om du vill låna boken, kontakta ägaren {ownerLink} för att komma överens om utlåning.</p>
            </div>
        );
    }

    if (book.Current_custody === userId) {
        return <div className="mt-5"><BookStatusBadge status="borrowed-by-me" /></div>;
    }

    return (
        <div>
            <div className="mt-5">
                <BookStatusBadge
                    status="borrowed-by-other"
                    loanedToProfile={loanedToProfile}
                    onUserProfileLoaded={onUserProfileLoaded}
                    isLoanedToProfileLoading={isLoanedToProfileLoading}
                />
            </div>
            <p className="mt-2 text-sm">
                Du kan kontakta ägaren {ownerLink} och/eller lånetagaren {" "}
                <UserProfileLink user={loanedToProfile} onUserProfileLoaded={onUserProfileLoaded} isLoading={isLoanedToProfileLoading} />
                {" "}för att låta dem veta att du är intresserad av att låna boken.
            </p>
        </div>
    );
}