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

function createAccount(event: React.FormEvent<HTMLFormElement>) {
    console.log("create account");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
  createUserWithEmailAndPassword(auth, email, password)
  .then(async(userCredential) => {
    // Signed up and signed in successfully
    const user = userCredential.user;
    console.log("User created and signed in:", user);

    // Save user data to Firestore
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      email: user.email,
      uid: user.uid,
      createdAt: new Date(),
    });
    console.log("User document created in Firestore");
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error creating user:", errorCode, errorMessage);

    if (errorCode === 'auth/weak-password') {
      alert('The password is too weak.');
    } else if (errorCode === 'auth/email-already-in-use') {
      alert('The email address is already in use by another account.');
    }
  });
}

export { login, logout, createAccount };