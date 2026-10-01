import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

async function login(email: string, password: string) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        const errorCode = (error as { code?: string }).code;
        if (
            errorCode === "auth/invalid-credential" ||
            errorCode === "auth/invalid-email" ||
            errorCode === "auth/user-not-found" ||
            errorCode === "auth/wrong-password"
        ) {
            throw new Error("Fel mejladress eller lösenord. Försök igen.");
        }

        throw new Error("Det gick inte att logga in just nu. Försök igen senare.");
    }
}

function logout() {
    console.log("logout");
    auth.signOut().then(() => {
        console.log("User signed out.");
    }).catch((error) => {
        console.error("Sign-out error:", error);
    });
}

async function createAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
        alert("Lösenorden matchar inte!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            email: user.email,
            uid: user.uid,
            createdAt: new Date(),
        });

        return user;
    } catch (error) {
        const errorCode = (error as { code?: string }).code;
        const errorMessage = (error as { message?: string }).message;
        console.error("Error creating user:", errorCode, errorMessage);

        if (errorCode === "auth/weak-password") {
            alert("Lösenordet är för svagt.");
        } else if (errorCode === "auth/email-already-in-use") {
            alert("E-postadressen används redan av ett annat konto.");
        } else {
            alert("Något gick fel när kontot skulle skapas. Försök igen.");
        }
    }
}

export { login, logout, createAccount };