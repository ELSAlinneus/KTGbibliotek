import Image from "next/image";
import { PublicUserProfile } from "@/lib/types/Profile";

export default function UserInfo({ user, onClose}: { user: PublicUserProfile, onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <div className="bg-slate-800 border border-slate-700 text-slate-200 p-6 rounded-lg w-80 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-white">
                    ✕
                </button>
                <Image
                    src={user.photoURL || "/default-profile.png"}
                    alt="Profile Picture"
                    width={100}
                    height={100}
                    className="rounded-full mb-4 mx-auto"
                />
                <h2 className="text-xl font-bold mb-4">Användarinfo</h2>
                <p><strong>Namn:</strong> {user.displayName || "N/A"}</p>
                <p><strong>Email:</strong> {user.email || "N/A"}</p>
            </div>
        </div>
    );
}