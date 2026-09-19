import { Book } from "@/lib/types/Book";
import BookStateBtns from "@/components/books/bookStateBtns";
import ProfileBookListItem from "@/components/profile/profileBookListItem";

type OwnedBookItemProps = {
    book: Book;
    onClick: () => void;
    onDelete: () => void;
    onGetBookBack: (book: Book) => void;
    onLendBook: (book: Book) => void;
};

export default function OwnedBookItem({ book, onClick, onDelete, onGetBookBack, onLendBook }: OwnedBookItemProps) {
    return (
        <ProfileBookListItem
            book={book}
            onClick={onClick}
            actions={
                <div className="flex items-center gap-2">
                    <BookStateBtns
                        book={book}
                        onDelete={onDelete}
                        onGetBookBack={onGetBookBack}
                        onLendBook={onLendBook}
                    />
                </div>
            }
        />
    );
}
