import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, onSnapshot, addDoc } from "firebase/firestore";
import { Book } from "../../lib/types/Book";
import { User } from "firebase/auth";

async function addBook(event: React.FormEvent<HTMLFormElement>, user: User | null) {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "");
    const author = String(formData.get("author") ?? "");
    const isbn = String(formData.get("isbn") ?? "");
    const language = String(formData.get("language") ?? "");
    const publicationYear = String(formData.get("publicationYear") ?? "");
    const coverImageUrl = String(formData.get("coverImageUrl") ?? "");

    if (!title || !author || !isbn) {        
        alert("Please fill in all required fields (title, author, isbn).");
        return;
    }
    if (user) {
        await addDoc(collection(db, "Books"), {
            Title: title,
            Author: author,
            ISBN: isbn,
            Language: language,
            PublicationYear: publicationYear,
            CoverImageUrl: coverImageUrl,
            Owner: user.uid, 
            Borrowed: false,
            Current_custody: user.uid
        })
        .then(() => {
            alert("Book added successfully");
        })
        .catch((error) => {
            alert("Error adding book: " + error.message);
        });

    } else {
        console.error("User is not authenticated. Cannot add book.");
    }
}

function deleteBook() {
    console.log("delete book");
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