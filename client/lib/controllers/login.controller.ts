import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Add this import
import { db } from "@/lib/firebase/firebase";

function login(event: React.FormEvent<HTMLFormElement>) {
    console.log("login");

    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log("User signed in:", user.email);
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Sign-in error:", errorMessage, errorCode);
  });

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