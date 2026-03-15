import { getInformationFromISBN } from "@/lib/controllers/books.controller";
import { Book } from "@/lib/types/Book";
import { useState } from "react";

export default function UploadBook() {

    const [bookInfo, setBookInfo] = useState<Book | null>(null);

    return (
        <div className="w-full p-4 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Upload a New Book</h2>
            <form className="space-y-4">
                <div>
                    <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">ISBN</label>
                    <input disabled={bookInfo !== null} type="text" id="isbn" name="isbn" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                {!bookInfo && (
                    <button type="button" onClick={async () => {
                        const isbn = (document.getElementById("isbn") as HTMLInputElement).value;
                        const bookInfo = await getInformationFromISBN(isbn);
                        console.log(bookInfo);
                        setBookInfo(bookInfo);
                    }} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300">
                        Hämta bokinformation
                    </button>
                )}
                {bookInfo && (
                    <button type="button" onClick={() => {
                        setBookInfo(null);
                        const isbnInput = document.getElementById("isbn") as HTMLInputElement;
                        if (isbnInput) {
                            isbnInput.value = "";
                        }
                    }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-500 transition duration-300">
                        Rensa ISBN 
                    </button>
                )}
                {bookInfo && (
                    <div className="mt-4">
                        <h3 className="text-lg font-bold pb-2">Fetched Book Information:</h3>
                        <div className="mb-4">
                            <label className="block font-bold text-gray-700 mb-2">Titel:</label>
                            <input disabled value={bookInfo.title} type="text" name="title"  />
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold text-gray-700 mb-2">Författare:</label>
                            <input disabled value={bookInfo.author} type="text" name="author" />
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold text-gray-700 mb-2">Språk:</label>           
                            <input disabled value={bookInfo.language} type="text" name="language" /> 
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold text-gray-700 mb-2">publiceringsår:</label>           
                            <input disabled value={bookInfo.publishedYear} type="text" name="publicationYear"/> 
                        </div>
                        <button type="submit" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300 shadow">
                            Lägg till bok
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}