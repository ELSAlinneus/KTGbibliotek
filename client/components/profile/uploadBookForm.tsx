import { addBook, ExternalBookInfo, getInformationFromISBN } from "@/lib/controllers/books.controller";
import { Book } from "@/lib/types/Book";
import { useState } from "react";
import { User } from "firebase/auth";
import ImgUploader from "@/components/imgUploader/imgUploader";

type NewBookFormProps = {
    onClose: () => void;
    user: User | null;
    onBookAdded: (book: Book) => void;
};

export default function UploadBookForm({ onClose, user, onBookAdded }: NewBookFormProps)  {

    const [bookInfo, setBookInfo] = useState<ExternalBookInfo | null>(null);
    const [infoFetched, setInfoFetched] = useState<boolean>(false);
    const [coverImageBlob, setCoverImageBlob] = useState<Blob | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string>("");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl rounded-lg border border-slate-700 bg-slate-800 p-6 text-slate-200 shadow-lg overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-slate-100">
                        Lägg till en ny bok
                    </h1>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-300 hover:text-red-400"
                        aria-label="Stäng"
                    >
                        ✕
                    </button>
                </div>
                <form className="p-4 bg-slate-900 rounded-lg" onSubmit={async (e) => {
                    e.preventDefault();
                    const newBook = await addBook(e, user, coverImageBlob ?? undefined);
                    if (newBook) {
                        onBookAdded(newBook);
                        setCoverImageBlob(null);
                        setCoverImagePreview("");
                        onClose();
                    }
                }}>
                    <div>
                        <label className="block font-bold text-slate-300 mb-2">ISBN:</label>
                        <input readOnly={bookInfo !== null} type="text" id="isbn" name="isbn" className="mt-1 block w-full border border-slate-600 bg-slate-800 text-slate-100 rounded-md shadow-sm p-2" />
                    </div>
                    {infoFetched && !bookInfo && (
                        <div>
                            <p className="mt-2 text-sm text-red-700">Ingen bokinformation kunde hämtas för det angivna ISBN-numret..</p>
                            <p className="mt-2 text-sm text-red-700">Dubbelkolla att du skrivit in rätt siffror.</p>
                        </div>
                    )}
                    {!bookInfo && (
                        <button type="button" onClick={async () => {
                            const isbn = (document.getElementById("isbn") as HTMLInputElement).value;
                            const bookInfo = await getInformationFromISBN(isbn);
                            console.log(bookInfo);
                            setBookInfo(bookInfo);
                            setInfoFetched(true);
                        }} className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300">
                            Hämta bokinformation
                        </button>
                    )}
                    {bookInfo && (
                        <button type="button" onClick={() => {
                            setBookInfo(null);
                            setInfoFetched(false);
                            setCoverImageBlob(null);
                            setCoverImagePreview("");
                            const isbnInput = document.getElementById("isbn") as HTMLInputElement;
                            if (isbnInput) {
                                isbnInput.value = "";
                            }
                        }} className="mt-2 rounded bg-slate-700 px-4 py-2 text-slate-200 transition duration-300 hover:bg-slate-600">
                            Rensa ISBN 
                        </button>
                    )}
                    {bookInfo && (
                        <div className="mt-4">
                            <h3 className="text-lg font-bold pb-2">Hämtad bokinformation:</h3>
                            <div className="mb-4">
                                <label className="block font-bold text-slate-300 mb-2">Titel:</label>
                                <input required defaultValue={bookInfo.title} type="text" name="title" className="w-full rounded border border-slate-600 p-2 text-slate-200" />
                            </div>
                            <div className="mb-4">
                                <label className="block font-bold text-slate-300 mb-2">Författare:</label>
                                <input required defaultValue={bookInfo.author} type="text" name="author" className="rounded border border-slate-600 p-2 text-slate-200"/>
                            </div>
                            <div className="mb-4">
                                <label className="block font-bold text-slate-300 mb-2">Språk:</label>           
                                <input readOnly value={bookInfo.language} type="text" name="language" /> 
                            </div>
                            <div className="mb-4">
                                <label className="block font-bold text-slate-300 mb-2">publiceringsår:</label>           
                                <input readOnly value={bookInfo.publishedYear} type="text" name="publicationYear"/> 
                            </div>
                            <div className="mb-4">
                                <label className="block font-bold text-slate-300 mb-2">Bokomslag:</label>           
                                <ImgUploader 
                                    value={coverImagePreview}
                                    onChange={(result) => {
                                        if (result) {
                                            setCoverImageBlob(result.blob);
                                            setCoverImagePreview(result.previewUrl);
                                        } else {
                                            setCoverImageBlob(null);
                                            setCoverImagePreview("");
                                        }
                                    }}
                                    className="w-36 h-40 cursor-pointer border-2 border-dashed border-slate-600 p-5 pt-10 text-center hover:border-slate-400"
                                />
                            </div>
                            <button type="submit" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300 shadow">
                                Lägg till bok
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}