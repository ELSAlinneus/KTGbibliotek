'use client'
import { logout } from "../../lib/controllers/login.controller";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase/firebase";
import NavbarItem from "./navbar-item";

export default function Topbar(){
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

    return (
        <div>
            <div className="w-full bg-blue-950 p-4 flex items-center justify-center">
                <h1 className="text-white text-5xl font-bold pb-4">KTG Bibliotek</h1>
            </div>
            <nav className="flex justify-between items-center bg-gray-800 p-4">
                <div className="flex space-x-4">
                    <NavbarItem title="Hem" href="/"></NavbarItem>
                    <NavbarItem title="Alla Böcker" href="/allbooks"></NavbarItem>
                </div>
                <div className="flex-grow" />
                <div className="flex space-x-4">
                    {user ? (
                        <>
                            <NavbarItem title="Profil" href="/profile"></NavbarItem>
                            <button onClick={logout} className="text-white">Logga ut</button>
                        </>
                    ) : (
                        <>
                            <NavbarItem title="Logga in" href="/login"></NavbarItem>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
}