import { addBook } from "@/lib/controllers/books.controller";
import { Book } from "@/lib/types/Book";
import { User } from "firebase/auth";

type NewBookFormProps = {
    onClose: () => void;
    user: User | null;
    onBookAdded: (book: Book) => void;
};

export default function NewBookForm({ onClose, user, onBookAdded }: NewBookFormProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Lägg till en ny bok
                    </h1>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-black hover:text-red-800 "
                        aria-label="Stäng"
                    >
                        ✕
                    </button>
                </div>
                <form className="p-4 bg-gray-100 rounded-lg" onSubmit={async (e) => {
                    e.preventDefault();
                    const newBook = await addBook(e, user);
                    if (newBook) {
                        onBookAdded(newBook);
                    }
                    onClose();
                }}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Titel:</label>
                        <input type="text" name="title" required className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Författare:</label>
                        <input type="text" name="author" required className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">ISBN:</label>           
                        <input type="text" name="isbn" required className="w-full p-2 border rounded" /> 
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Språk:</label>           
                        <input type="text" name="language" className="w-full p-2 border rounded" /> 
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">publiceringsår:</label>           
                        <input type="text" name="publicationYear" className="w-full p-2 border rounded" /> 
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Omslagsbild URL:</label>           
                        <input type="text" name="imageUrl" className="w-full p-2 border rounded" />
                    </div>
                    <button type="submit" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300 shadow">
                        Lägg till bok
                    </button>
                </form>
            </div>
        </div>
    );
}