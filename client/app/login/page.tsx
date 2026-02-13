"use client";
import { useEffect, useState } from "react";
import Form from "./Form";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [hasAccount, setHasAccount] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                router.push('/');
            }
        });
        return () => unsub();
    }, [router]);

    const toggleAccount = () => {
        setHasAccount((prev) => !prev);
    };

    return (
        <div className="mt-12 flex items-center justify-center px-4">
            {user ? null : (
                <Form
                    onToggleForms={toggleAccount}
                    formType={hasAccount ? "signin" : "signup"}
                />
            )}
        </div>
    );
}