import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, onSnapshot, addDoc, doc, deleteDoc } from "firebase/firestore";
import { Book } from "../../lib/types/Book";
import { User } from "firebase/auth";

async function addBook(event: React.FormEvent<HTMLFormElement>, user: User | null): Promise<Book | null> {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "");
    const author = String(formData.get("author") ?? "");
    const isbn = String(formData.get("isbn") ?? "");
    const language = String(formData.get("language") ?? "");
    const publicationYear = String(formData.get("publicationYear") ?? "");
    const imageUrl = String(formData.get("imageUrl") ?? "");

    if (!title || !author || !isbn) {        
        alert("Please fill in all required fields (title, author, isbn).");
        return null;
    }
    if (user) {
        try {
            const docRef = await addDoc(collection(db, "Books"), {
                Title: title,
                Author: author,
                ISBN: isbn,
                Language: language,
                Year_of_publication: publicationYear,
                ImageURL: imageUrl,
                Owner: user.uid, 
                Borrowed: false,
                Current_custody: user.uid
            });
            alert("Boken har lagts till i biblioteket!");
            return {
                id: docRef.id,
                Title: title,
                Author: author,
                ISBN: isbn,
                Language: language,
                Year_of_publication: publicationYear,
                ImageURL: imageUrl,
                Owner: user.uid,
                Borrowed: false,
                Current_custody: user.uid
            };
        } catch (error: any) {
            alert("Error adding book: " + error.message);
            return null;
        }
    } else {
        console.error("User is not authenticated. Cannot add book.");
        return null;
    }
}

async function deleteBook(bookId: string): Promise<boolean> {
    const confirmDelete = window.confirm("Är du säker på att du vill ta bort denna bok? Du kan inte ångra dig.");
    if (confirmDelete) {
        console.log("delete book with id:", bookId);
        const bookRef = doc(db, "Books", bookId);
        try {
            await deleteDoc(bookRef);
            console.log("Book deleted successfully");
            return true;
        } catch (error) {
            console.error("Error deleting book: ", error);
            return false;
        }
    }
    return false;
}

function editBook() {
    console.log("edit book");
}

async function getAllBooks(): Promise<Book[]> { 
    const snapshot = await getDocs(collection(db, "Books"));
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Book));
}

function borrowBook() {
    console.log("borrow book");
}

function returnBook() {
    console.log("return book");
}

function subscribeBooks(onUpdate: (books: Book[]) => void) {
    const unsubscribe = onSnapshot(collection(db, "Books"), (querySnapshot: any) => {
        const books = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Book));
        onUpdate(books);
    });
    return unsubscribe;
}

export { addBook, deleteBook, editBook, getAllBooks, borrowBook, returnBook, subscribeBooks };