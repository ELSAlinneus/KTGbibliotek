import { Book } from "@/lib/types/Book";
import { PublicUserProfile } from "@/lib/types/Profile";
import BookStatusBadge from "@/components/books/bookStatusBadge";

export default function BookStateBtns({ book, onDelete, onGetBookBack, onLendBook, loanedToProfile, onUserProfileLoaded, isLoanedToProfileLoading = false }: { book: Book; onDelete: () => void; onGetBookBack: (book: Book) => void; onLendBook: (book: Book) => void; loanedToProfile?: PublicUserProfile | null; onUserProfileLoaded?: (user: PublicUserProfile) => void; isLoanedToProfileLoading?: boolean }) {
    return (
        <div className="mt-2">
            {book.Borrowed && (
                <div className="mb-2 flex justify-end">
                    <BookStatusBadge
                        status="i-have-lent-to"
                        loanedToProfile={loanedToProfile}
                        onUserProfileLoaded={onUserProfileLoaded}
                        isLoanedToProfileLoading={isLoanedToProfileLoading}
                    />
                </div>
            )}

            <div className="flex row justify-end items-center">
                {book.Borrowed ? (
                    <div className="flex row justify-end items-center">
                        
                        <button className="mr-2 p-1 h-9 min-w-25 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300 shadow "
                        onClick={(e) => {
                            e.stopPropagation();
                            const confirmBookBack = window.confirm("Är du säker på att har fått tillbaka denna bok?");
                            if(!confirmBookBack) return;
                            onGetBookBack(book);
                        }}>
                            Fått tillbaka
                        </button>
                    </div>
                ):(
                    <button className="mr-2 h-9 min-w-20 whitespace-nowrap rounded bg-gray-500 px-2 text-white shadow transition duration-300 hover:bg-gray-700"
                    onClick={(e) => {
                        e.stopPropagation();
                        onLendBook(book);
                    }}>
                        Låna ut
                    </button>
                )}
                <button className="h-9 min-w-20 whitespace-nowrap rounded bg-gray-600 px-2 text-white shadow transition duration-300 hover:bg-red-700"
                onClick={async (e) => {
                    e.stopPropagation();
                    onDelete();
                }}> 
                    Ta bort
                </button>
            </div>
        </div>
    );
}