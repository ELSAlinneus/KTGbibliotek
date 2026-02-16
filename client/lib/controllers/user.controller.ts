import { db, auth } from "@/lib/firebase/firebase";
import { updateProfile } from "firebase/auth"; 
import { Book } from "../types/Book";
import { collection, getDocs } from "@firebase/firestore";
export interface Profile {
    username: string;
    email: string;
}

function handleUsernameChange(newUsername: string) {
    const user = auth.currentUser;
    if (user) {
        updateProfile(user, { displayName: newUsername })
            .then(() => {
                console.log("Username updated successfully");
            })
            .catch((error) => {
                console.error("Error updating username:", error);
            });
    } else {
        console.error("No user is currently signed in.");
    }
    console.log("displayname ", user?.displayName);
}

function handleUserProfileChange(profile: Profile) {
    console.log("handle profile change", profile);

    handleUsernameChange(profile.username);
    
    const user = auth.currentUser;
    if (user) {
        //TODO: Implement email change functionality
        console.log("Email change functionality not implemented yet.");
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