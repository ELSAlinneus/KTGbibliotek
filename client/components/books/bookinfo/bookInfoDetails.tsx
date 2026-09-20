import UserProfileLink from "@/components/books/userProfileLink";
import { Book } from "@/lib/types/Book";
import { PublicUserProfile } from "@/lib/types/Profile";
import BookInfoStatus from "./bookInfoStatus";

type BookInfoDetailsProps = {
    book: Book;
    userId: string | null;
    readerProfiles: PublicUserProfile[];
    ownerProfile: PublicUserProfile | null;
    loanedToProfile: PublicUserProfile | null;
    isOwnerProfileLoading: boolean;
    isLoanedToProfileLoading: boolean;
    onUserProfileLoaded: (user: PublicUserProfile) => void;
    onDelete: () => void;
    onGetBookBack: () => void;
    onLendBook: () => void;
};

export default function BookInfoDetails({
    book,
    userId,
    readerProfiles,
    ownerProfile,
    loanedToProfile,
    isOwnerProfileLoading,
    isLoanedToProfileLoading,
    onUserProfileLoaded,
    onDelete,
    onGetBookBack,
    onLendBook,
}: BookInfoDetailsProps) {
    return (
        <div className="mt-4 h-72 min-w-0 flex-1 space-y-1 overflow-y-auto pr-2 text-left text-slate-300">
            {book.Author && <p className="text-sm">Författare: {book.Author}</p>}
            {book.Publisher && <p className="text-sm">Förlag: {book.Publisher}</p>}
            {!!book.Year_of_publication && <p className="text-sm">Utgiven: {book.Year_of_publication}</p>}
            {book.Language && <p className="text-sm">Språk: {book.Language}</p>}
            {readerProfiles.length > 0 && (
                <p className="mt-2 text-sm">
                    Läst av: {readerProfiles.map((profile, index) => (
                        <span key={profile.userId}>
                            <UserProfileLink user={profile} onUserProfileLoaded={onUserProfileLoaded} />
                            {index < readerProfiles.length - 1 && ", "}
                        </span>
                    ))}
                </p>
            )}
            {book.Owner && userId !== book.Owner && (
                <p className="text-sm">Boken ägs av <UserProfileLink user={ownerProfile} onUserProfileLoaded={onUserProfileLoaded} isLoading={isOwnerProfileLoading} /></p>
            )}
            <BookInfoStatus
                book={book}
                userId={userId}
                ownerProfile={ownerProfile}
                loanedToProfile={loanedToProfile}
                isOwnerProfileLoading={isOwnerProfileLoading}
                isLoanedToProfileLoading={isLoanedToProfileLoading}
                onUserProfileLoaded={onUserProfileLoaded}
                onDelete={onDelete}
                onGetBookBack={onGetBookBack}
                onLendBook={onLendBook}
            />
        </div>
    );
}