'use client'
import { useRouter } from "next/navigation";
import { logout } from "../../lib/controllers/login.controller";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase/firebase";

export default function Topbar(){

    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setReady(true);
        });
        return () => unsub();
    }, []);

    if (!ready) return null;

    const handleClick = (e: any) => {
        e.preventDefault();
        router.push(e.target.href);
    }

    return (
        <div>
            <h1 className="text-white text-5xl font-bold pb-4">KTG Bibliotek</h1>
            <nav className="flex justify-between items-center bg-gray-800 p-4">
                <div className="flex space-x-4">
                    <a href="/" className="text-white">Hem</a>
                    <a href="/allbooks" className="text-white" onClick={handleClick}>Alla Böcker</a>
                </div>
                <div className="flex-grow" />
                <div className="flex space-x-4">
                    {user ? (
                        <>
                            <a href="/profile" className="text-white">Profil</a>
                            <a href="/settings" className="text-white">Inställningar</a>
                            <a onClick={logout} className="text-white">Logga ut</a>
                        </>
                    ) : (
                        <>
                            <a href="/login" className="text-white">Logga in</a>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
}
