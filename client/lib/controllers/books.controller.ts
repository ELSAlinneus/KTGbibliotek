import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { Book } from "@/app/allbooks/page";

function addBook() {
    console.log("add book");
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