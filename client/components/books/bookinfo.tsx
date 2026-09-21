import { Book } from "@/lib/types/Book";
import UserInfo from "@/components/profile/userinfo";
import BookInfoCard from "./bookinfo/bookInfoCard";
import BookInfoDetails from "./bookinfo/bookInfoDetails";
import BookInfoImages from "./bookinfo/bookInfoImages";
import { useBookInfo } from "@/hooks/useBookInfo";

export default function BookInfo({ book, onClose, onDelete, onGetBookBack, onLendBook, onBookUpdated }: { book: Book, onClose: () => void, onDelete: (bookId: string) => void, onGetBookBack: (book: Book) => void, onLendBook: (book: Book) => void, onBookUpdated?: (book: Book) => void }) {
    const {
        userId,
        userProfile,
        setUserProfile,
        ownerProfile,
        loanedToProfile,
        isOwnerProfileLoading,
        isLoanedToProfileLoading,
        imageUrl,
        backCoverImageUrl,
        readerProfiles,
        isUpdatingReadStatus,
        hasRead,
        toggleReadStatus,
        handleImageChange,
        handleBackCoverImageChange,
        removeBookImage,
        removeBackCoverImage
    } = useBookInfo(book, onBookUpdated);

    const isOwner = userId === book.Owner;

    return (
        <BookInfoCard title={book.Title} onClose={onClose}>
            <div className="relative flex w-full flex-wrap items-start gap-6 rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                {userId && (
                    <label className="absolute right-5 top-4 flex max-w-[45%] items-center gap-2 text-right text-sm font-medium text-slate-200">
                        <input
                            type="checkbox"
                            id="readStatus"
                            checked={hasRead}
                            onChange={toggleReadStatus}
                            disabled={isUpdatingReadStatus}
                            className="h-4 w-4 shrink-0 rounded border border-slate-600 appearance-none checked:appearance-auto bg-transparent accent-slate-700 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span>{isUpdatingReadStatus ? "Sparar..." : "Jag har läst denna bok"}</span>
                    </label>
                )}
                <BookInfoImages
                    title={book.Title}
                    imageUrl={imageUrl}
                    backCoverImageUrl={backCoverImageUrl}
                    isOwner={isOwner}
                    onImageChange={handleImageChange}
                    onBackCoverImageChange={handleBackCoverImageChange}
                    onRemoveImage={removeBookImage}
                    onRemoveBackCoverImage={removeBackCoverImage}
                />
                <BookInfoDetails
                    book={book}
                    userId={userId}
                    readerProfiles={readerProfiles}
                    ownerProfile={ownerProfile}
                    loanedToProfile={loanedToProfile}
                    isOwnerProfileLoading={isOwnerProfileLoading}
                    isLoanedToProfileLoading={isLoanedToProfileLoading}
                    onUserProfileLoaded={setUserProfile}
                    onDelete={() => onDelete(book.id)}
                    onGetBookBack={() => onGetBookBack(book)}
                    onLendBook={() => onLendBook(book)}
                />
            </div>
            {userProfile && <UserInfo user={userProfile} onClose={() => setUserProfile(null)} />}
        </BookInfoCard>
    );
}