import { borrowBook } from "../../lib/controllers/books.controller";

export default function BookInfo({ book }: { book: any }) {
    return (
        <div>
            <h1>{book.Title}</h1>
            <img src={book.CoverImage} alt={book.Title} />
            <p>{book.Author}</p>
            <p>{book.Year_of_publication}</p>
            <p>{book.Language}</p>
            <p>boken ägs av {book.Owner}</p>

            { !book.Borrowed && (
                <button onClick={borrowBook}>Låna</button>
            )}
        </div>
    );
}