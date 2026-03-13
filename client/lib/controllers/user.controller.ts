import { db, auth } from "@/lib/firebase/firebase";
import { updateProfile } from "firebase/auth"; 
import { Book } from "../types/Book";
import { collection, getDocs } from "@firebase/firestore";
import { Profile } from "../types/Profile";

function handleUsernameChange(user: any, newUsername: string) {

    updateProfile(user, { displayName: newUsername })
        .then(() => {
            console.log("Username updated successfully");
        })
        .catch((error) => {
            console.error("Error updating username:", error);
        });
}

function handleUserProfileChange(profile: Profile) {
    const user = auth.currentUser;
    if (user) {
        const confirmChange = window.confirm("Är du säker på att du vill ändra dina användaruppgifter?");
        if (confirmChange) {
            console.log("handle profile change", profile);

            handleUsernameChange(user, profile.username);
            //TODO: Implement email change functionality
        }
    } else {
        console.error("No user is currently signed in.");
    }
}

async function getUserBooks() {
    console.log("get user books");
    const books: Book[] = [];
    const querySnapshot = await getDocs(collection(db, "Books"));

    querySnapshot.forEach((doc: any) => {
        const bookData = doc.data();
        if (bookData.Owner === auth.currentUser?.uid) {
            books.push({ id: doc.id, ...bookData } as Book);
        }
    });
    return books;
}

export { handleUsernameChange, handleUserProfileChange, getUserBooks };