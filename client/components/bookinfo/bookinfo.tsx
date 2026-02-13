import { borrowBook } from "../../lib/controllers/books.controller";

export default function BookInfo({ book }: { book: any }) {
    return (
        <div className="mx-auto w-full max-w-xl rounded-xl border border-slate-200 bg-slate-100 p-6 shadow-sm flex flex-row items-start justify-between ">
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 ml-8 ">
                <img
                    className="h-64 w-full object-cover"
                    src={book.ImageURL}
                    alt={book.Title}
                />
            </div>
            <div className="mt-10 space-y-1 text-slate-700 mr-25">
                <h1 className="text-2xl font-semibold text-slate-900">{book.Title}</h1>
                {book.Author && <p className="text-sm">Författare: {book.Author}</p>}
                {book.Year_of_publication && <p className="text-sm">Utgiven: {book.Year_of_publication}</p>}
                {book.Language && <p className="text-sm">Språk: {book.Language}</p>}
                {book.Owner && <p className="text-sm">Boken ägs av {book.Owner}</p>}
                {!book.Borrowed && (
                    <button
                        onClick={borrowBook}
                        className="mt-5 inline-flex items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-600  cursor-pointer"
                    >
                        Låna
                    </button>
                )}
            </div>

        </div>
    );
}