import { db } from "@/lib/firebase/firebase";
import { arrayRemove, arrayUnion, collection, getDocs, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { Book } from "../../lib/types/Book";
import { User } from "firebase/auth";
import { LibrisBookResult } from "@/lib/types/LibrisBookResult";

const MAX_COVER_IMAGE_BYTES = 262500;

async function addBook(
    event: React.FormEvent<HTMLFormElement>,
    user: User | null,
    coverImageBlob?: Blob
): Promise<Book | null> {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "");
    const author = String(formData.get("author") ?? "");
    const publisher = String(formData.get("publisher") ?? "");
    const isbn = String(formData.get("isbn") ?? "");
    const language = String(formData.get("language") ?? "");
    const publicationYear = String(formData.get("publicationYear") ?? "");
    const yearOfPublication = Number(publicationYear) || 0;

    if (!title || !author || !isbn) {        
        alert("Please fill in all required fields (title, author, isbn).");
        return null;
    }
    if (user) {
        try {
            let imageUrl = "";

            if (coverImageBlob) {
                if (coverImageBlob.size > MAX_COVER_IMAGE_BYTES) {
                    alert("Bokomslaget är för stort. Välj en mindre bild.");
                    return null;
                }

                imageUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result || ""));
                    reader.onerror = () => reject(new Error("Could not read image blob"));
                    reader.readAsDataURL(coverImageBlob);
                });
            }

            const docRef = await addDoc(collection(db, "Books"), {
                Title: title,
                Author: author,
                Publisher: publisher,
                ISBN: isbn,
                Language: language,
                Year_of_publication: yearOfPublication,
                ImageURL: imageUrl,
                Owner: user.uid,
                Borrowed: false,
                Current_custody: user.uid,
                Readers: []
            });
            alert("Boken har lagts till i biblioteket!");
            return {
                id: docRef.id,
                Title: title,
                Author: author,
                Publisher: publisher,
                ISBN: isbn,
                Language: language,
                Year_of_publication: yearOfPublication,
                ImageURL: imageUrl,
                Owner: user.uid,
                Borrowed: false,
                Current_custody: user.uid,
                Readers: []
            };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            alert("Error adding book: " + message);
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

async function getAllBooks(): Promise<Book[]> { 
    const snapshot = await getDocs(collection(db, "Books"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Book));
}

function subscribeBooks(onUpdate: (books: Book[]) => void) {
    const unsubscribe = onSnapshot(collection(db, "Books"), (querySnapshot) => {
        const books = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Book));
        onUpdate(books);
    });
    return unsubscribe;
}

async function getInformationFromISBN(isbn: string): Promise<LibrisBookResult | null> {
    const cleanIsbn = isbn.replace(/[- ]/g, "");
    if(cleanIsbn.length < 1) return null;

    const url = `https://libris.kb.se/xsearch?query=isbn:${cleanIsbn}&format=json`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Libris API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.xsearch.list && data.xsearch.list.length > 0) {
            const bookData = data.xsearch.list[0];

            console.log("Fetched book data from Libris:", bookData);

            return {
                title: bookData.title || "Okänd titel",
                author: bookData.creator || "Okänd författare",
                publisher: bookData.publisher || "Okänd utgivare",
                language: bookData.language || "Okänt språk",
                publishedYear: bookData.date || "Okänt publiceringsår",
            };
        }

        return null; 
    } catch (error) {
        console.error("Kunde inte hämta bokinfo:", error);
        return null;
    }
}

async function manageBookLoan(bookId: string, currentCustodyId: string | null, borrowstate: boolean): Promise<boolean> {
    const bookRef = doc(db, "Books", bookId);
    // TODO validate currentCustodyId to a valid user 
    //currently no safety for wrong input
    try {
        await updateDoc(bookRef, {
            Borrowed: borrowstate,
            Current_custody: currentCustodyId
        });
        return true;
    } catch (error) {
        console.error("Error updating book loan state: ", error);
        return false;
    }
}

async function updateBookImage(bookId: string, imageBlob?: Blob): Promise<string> {
    let imageUrl = "";

    if (imageBlob) {
        if (imageBlob.size > MAX_COVER_IMAGE_BYTES) {
            throw new Error("Bokomslaget är för stort. Välj en mindre bild.");
        }

        imageUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Kunde inte läsa bilden."));
            reader.readAsDataURL(imageBlob);
        });
    }

    await updateDoc(doc(db, "Books", bookId), { ImageURL: imageUrl });
    return imageUrl;
}

async function updateBookReadStatus(bookId: string, userId: string, hasRead: boolean): Promise<boolean> {
    try {
        await updateDoc(doc(db, "Books", bookId), {
            Readers: hasRead ? arrayUnion(userId) : arrayRemove(userId)
        });
        return true;
    } catch (error) {
        console.error("Error updating book read status: ", error);
        return false;
    }
}

export { addBook, deleteBook, getAllBooks, subscribeBooks, getInformationFromISBN, manageBookLoan, updateBookImage, updateBookReadStatus };