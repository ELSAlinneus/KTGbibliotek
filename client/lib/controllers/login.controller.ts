import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

function login(event: React.FormEvent<HTMLFormElement>) {
    console.log("login");

    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    var user = userCredential.user;
    console.log("User signed in:", user.email);
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.error("Sign-in error:", errorMessage);
  });

}

function logout() {
    console.log("logout");
}

export { login, logout };