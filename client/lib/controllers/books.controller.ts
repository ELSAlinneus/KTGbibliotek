import { db } from "@/lib/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

function addBook() {
    console.log("add book");
}

function deleteBook() {
    console.log("delete book");
}

function editBook() {
    console.log("edit book");
}
function getAllBooks() { 
    console.log("get all books");

    const books: any[] = [];
    getDocs(collection(db, "Books")).then((querySnapshot: any) => { 
        querySnapshot.forEach((doc: any) => { 
            console.log(doc.id, " => ", doc.data()); 
            books.push({ id: doc.id, ...doc.data() });
        }); 
    });
    
}

function borrowBook() {
    console.log("borrow book");
}

function returnBook() {
    console.log("return book");
}

export { addBook, deleteBook, editBook, getAllBooks, borrowBook, returnBook };