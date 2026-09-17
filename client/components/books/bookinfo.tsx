import { Book } from "@/lib/types/Book";
import Image from "next/image";
import UserInfo from "@/components/profile/userinfo";
import UserProfileLink from "./userProfileLink";
import BookStateBtns from "@/components/books/bookStateBtns";
import BookStatusBadge from "@/components/books/bookStatusBadge";
import ImgUploader from "@/components/imgUploader/imgUploader";
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
        readerProfiles,
        isUpdatingReadStatus,
        hasRead,
        toggleReadStatus,
        handleImageChange,
        removeBookImage
    } = useBookInfo(book, onBookUpdated);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-3xl rounded-lg border border-slate-700 bg-slate-800 p-6 text-slate-200 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-slate-100">
                        {book.Title}
                    </h1>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="text-slate-300 hover:text-red-400"
                        aria-label="Stäng"
                    >
                        ✕
                    </button>
                </div>
                <div className="relative w-full rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm flex items-start gap-6">
                    {userId && (
                        <label className="absolute right-5 top-4 flex max-w-[45%] items-center gap-2 text-right text-sm font-medium text-slate-200">
                            <input
                                type="checkbox"
                                id="readStatus"
                                checked={hasRead}
                                onChange={toggleReadStatus}
                                disabled={!userId || isUpdatingReadStatus}
                                className="h-4 w-4 shrink-0 rounded border border-slate-600 appearance-none checked:appearance-auto bg-transparent accent-slate-700 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <span>{isUpdatingReadStatus ? "Sparar..." : "Jag har läst denna bok"}</span>
                        </label>
                    )}
                    <div className="relative h-72 w-48 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-700">
                        {imageUrl ? (
                            <Image
                                fill
                                className="h-full w-full object-cover"
                                src={imageUrl}
                                alt={book.Title}
                                unoptimized
                            />
                        ) : (
                            <div className="h-full w-full"></div>
                        )}
                        {userId === book.Owner && imageUrl && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center ">
                                <button
                                    type="button"
                                    onClick={removeBookImage}
                                    className="absolute right-2 top-2 rounded-full border border-white/20 bg-slate-950/85 px-2 py-1 text-sm font-medium text-white shadow-lg transition hover:border-white/50 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                                    aria-label="Ta bort omslagsbild"
                                >
                                    ✕
                                </button>
                            </div>
                        )} : {(userId === book.Owner && !imageUrl) && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 border-2 border-dashed border-white/70 rounded-lg">
                                <ImgUploader
                                    value=""
                                    onChange={handleImageChange}
                                    label="Lägg till omslagsbild"
                                    aspect={2 / 3}
                                    className="flex h-full w-full items-center justify-center px-3 py-2 text-center text-sm text-white transition "
                                />
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex-1 min-w-0 h-72 overflow-y-auto text-left pr-2 space-y-1 text-slate-300">
                        {book.Author && <p className="text-sm">Författare: {book.Author}</p>}
                        {book.Year_of_publication && <p className="text-sm">Utgiven: {book.Year_of_publication}</p>}
                        {book.Language && <p className="text-sm">Språk: {book.Language}</p>}
                        {readerProfiles.length > 0 && (
                            <p className="mt-2 text-sm text-slate-300">
                                Läst av: {readerProfiles.map((profile, index) => (
                                    <span key={profile.userId}>
                                        <UserProfileLink
                                            user={profile}
                                            onUserProfileLoaded={setUserProfile}
                                        />
                                        {index < readerProfiles.length - 1 && ", "}
                                    </span>
                                ))}
                            </p>
                        )}
                        {book.Owner && userId != book.Owner &&(
                            <p className="text-sm">
                                Boken ägs av{" "}
                                <UserProfileLink
                                    user={ownerProfile}
                                    onUserProfileLoaded={setUserProfile}
                                    isLoading={isOwnerProfileLoading}
                                />
                            </p>
                        )}
                        {userId === book.Owner ? (
                            <div>
                                <div className="mt-2">
                                    <BookStatusBadge status="my-book" />
                                </div>
                                <BookStateBtns book={book} 
                                loanedToProfile={loanedToProfile}
                                onUserProfileLoaded={setUserProfile}
                                isLoanedToProfileLoading={isLoanedToProfileLoading}
                                onDelete={() => {onDelete(book.id)}} 
                                onGetBookBack={() => {onGetBookBack(book)}} 
                                onLendBook={() => {onLendBook(book)}} />
                            </div>
                        ) : !book.Borrowed ? (
                            <div>
                                <div className="mt-5">
                                    <BookStatusBadge status="available" />
                                </div>
                                <p className="text-sm mt-2">
                                    Om du vill låna boken, kontakta ägaren{" "}
                                    <UserProfileLink
                                        user={ownerProfile}
                                        onUserProfileLoaded={setUserProfile}
                                        isLoading={isOwnerProfileLoading}
                                    />
                                    {" "}för att komma överens om utlåning.
                                </p>
                            </div>
                        ) : book.Current_custody === userId ? (
                            <div className="mt-5">
                                <BookStatusBadge status="borrowed-by-me" />
                            </div>
                        ) : (
                            <div>
                                <div className="mt-5">
                                    <BookStatusBadge
                                        status="borrowed-by-other"
                                        loanedToProfile={loanedToProfile}
                                        onUserProfileLoaded={setUserProfile}
                                        isLoanedToProfileLoading={isLoanedToProfileLoading}
                                    />
                                </div>
                                <p className="text-sm mt-2">
                                    Du kan kontakta ägaren{" "}
                                    <UserProfileLink
                                        user={ownerProfile}
                                        onUserProfileLoaded={setUserProfile}
                                        isLoading={isOwnerProfileLoading}
                                    />
                                    {" "}och/eller lånetagaren{" "}
                                    <UserProfileLink
                                        user={loanedToProfile}
                                        onUserProfileLoaded={setUserProfile}
                                        isLoading={isLoanedToProfileLoading}
                                    />
                                    {" "}för att låta dem veta att du är intresserad av att låna boken.
                                </p>                            
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {userProfile && <UserInfo user={userProfile} onClose={() => setUserProfile(null)} />}
        </div>
    );
}