import { getAllBooks } from "../../lib/controllers/books.controller";

export default function AllBooksPage() {
   
    return (
        <div>
            all books
            <button onClick={getAllBooks} >Get all books</button>
        </div>
    );
}