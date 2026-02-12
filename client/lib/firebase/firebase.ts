import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };