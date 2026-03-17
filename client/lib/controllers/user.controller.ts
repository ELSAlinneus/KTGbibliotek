import { db, auth } from "@/lib/firebase/firebase";
import { updateProfile } from "firebase/auth";
import { Book } from "../types/Book";
import { collection, getDoc, getDocs, doc, setDoc } from "@firebase/firestore";
import { PublicUserProfile } from "../types/Profile";

import { User } from "firebase/auth";

async function handleUsernameChange(user: User, newUsername: string) {
    const sanitizedUsername = newUsername.trim();
    if (!sanitizedUsername) {
        throw new Error("Användarnamn kan inte vara tomt.");
    }

    if (sanitizedUsername.length > 50) {
        throw new Error("Användarnamnet är för långt.");
    }

    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, { username: sanitizedUsername }, { merge: true });

    await updateProfile(user, { displayName: sanitizedUsername });
    console.log("Username updated successfully");
}

async function handleUserProfileChange(profile: PublicUserProfile) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user is currently signed in.");
    }

    const confirmChange = window.confirm("Är du säker på att du vill ändra dina användaruppgifter?");
    if (!confirmChange) {
        return;
    }

    console.log("handle profile change", profile);

    if (profile.displayName.trim() === (user.displayName || "").trim()) {
        return;
    }

    await handleUsernameChange(user, profile.displayName);
    //TODO: Implement email change functionality
}

async function handleUserProfilePictureChange(profile: PublicUserProfile, pictureBlob?: Blob) {
    const user = auth.currentUser;
    if (user) {
        const confirmChange = window.confirm("Är du säker på att du vill ändra din profilbild?");
        if (confirmChange) {
            console.log("handle profile picture change", profile);

            let profilePicture = profile.photoURL || "";

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

async function getUserByUid(uid: string): Promise<PublicUserProfile | null> {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        return null;
    }

    const data = userDoc.data() as { userId?: string; username?: string; email?: string; profilePicture?: string };
    return {
        userId: data.uid || "",
        displayName: data.username || "Okänd",
        email: data.email || "",
        photoURL: data.profilePicture || ""
    };
}

async function getAllUsers(): Promise<PublicUserProfile[]> {
    const users: PublicUserProfile[] = [];
    const querySnapshot = await getDocs(collection(db, "users"));

    querySnapshot.forEach((doc) => {
        const data = doc.data() as { userId?: string; username?: string; email?: string; profilePicture?: string };
        users.push({
            userId: data.uid || "",
            displayName: data.username || "Okänd",
            email: data.email || "",
            photoURL: data.profilePicture || ""
        });
    });

    return users;
}

export { handleUsernameChange, handleUserProfileChange, handleUserProfilePictureChange, getUserBooks, getUserProfilePicture, getUserByUid, getAllUsers };