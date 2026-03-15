import { db, auth } from "@/lib/firebase/firebase";
import { updateProfile } from "firebase/auth";
import { Book } from "../types/Book";
import { collection, getDoc, getDocs, doc, setDoc } from "@firebase/firestore";
import { Profile } from "../types/Profile";

import { User } from "firebase/auth";

function handleUsernameChange(user: User, newUsername: string) {

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

async function handleUserProfilePictureChange(profile: Profile, pictureBlob?: Blob) {
    const user = auth.currentUser;
    if (user) {
        const confirmChange = window.confirm("Är du säker på att du vill ändra din profilbild?");
        if (confirmChange) {
            console.log("handle profile picture change", profile);

            let profilePicture = profile.picture || "";

            if (pictureBlob) {
                profilePicture = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result || ""));
                    reader.onerror = () => reject(new Error("Could not read image blob"));
                    reader.readAsDataURL(pictureBlob);
                });
            }

            if (profilePicture.length > 250000) {
                alert("Profilbilden är för stor. Välj en mindre bild.");
                return;
            }

            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, { profilePicture }, { merge: true });
        }
    } else {
        console.error("No user is currently signed in.");
    }
}

async function getUserProfilePicture(uid: string) {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        return "";
    }

    const data = userDoc.data() as { profilePicture?: string };
    return data.profilePicture || "";
}

async function getUserBooks() {
    console.log("get user books");
    const books: Book[] = [];
    const querySnapshot = await getDocs(collection(db, "Books"));

    querySnapshot.forEach((doc) => {
        const bookData = doc.data();
        if (bookData.Owner === auth.currentUser?.uid) {
            books.push({ id: doc.id, ...bookData } as Book);
        }
    });
    return books;
}

export { handleUsernameChange, handleUserProfileChange, handleUserProfilePictureChange, getUserBooks, getUserProfilePicture };