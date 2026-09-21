import { PublicUserProfile } from "@/lib/types/Profile";

type ProfileDetailsProps = {
    profile: PublicUserProfile;
    isEditing: boolean;
    onEditingChange: (isEditing: boolean) => void;
    onProfileChange: (profile: PublicUserProfile) => void;
    onSave: () => Promise<void>;
};

export default function ProfileDetails({ profile, isEditing, onEditingChange, onProfileChange, onSave }: ProfileDetailsProps) {
    return (
        <div className="mb-4 ml-10 mr-10 rounded-lg border border-slate-700 bg-slate-800 p-4">
            <div className="mb-4 flex items-center justify-between">
                <p className="font-bold">Användaruppgifter</p>
                <button type="button" aria-label="Redigera användaruppgifter" onClick={() => onEditingChange(!isEditing)}>
                    <i className="fa fa-pen-to-square" />
                </button>
            </div>
            <div className="mb-4 flex items-center">
                <label className="mr-2 text-slate-300">Användarnamn:</label>
                <input
                    type="text"
                    value={profile.displayName}
                    onChange={(event) => onProfileChange({ ...profile, displayName: event.target.value })}
                    readOnly={!isEditing}
                    className="h-10 min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 p-2 text-slate-100"
                />
            </div>
            <div className="mb-4 flex items-start">
                <label className="mr-2 pt-2 text-slate-300">Bio:</label>
                <div className="min-w-0 flex-1">
                    <input
                        type="text"
                        value={profile.bio || ""}
                        onChange={(event) => onProfileChange({ ...profile, bio: event.target.value })}
                        readOnly={!isEditing}
                        className="h-10 w-full rounded border border-slate-600 bg-slate-900 p-2 text-slate-100"
                        maxLength={250}
                        aria-describedby="bio-character-count"
                        placeholder="Berätta om dig själv..."
                    />
                    <p id="bio-character-count" className={`mt-1 text-right text-sm ${(profile.bio || "").length >= 250 ? "text-amber-400" : "text-slate-400"}`}>
                        {(profile.bio || "").length}/250 tecken
                        {(profile.bio || "").length >= 250 && " - maxgränsen är nådd"}
                    </p>
                </div>
            </div>
            <div className="mb-4 flex items-center">
                <label className="mr-2 text-slate-300">Telefon:</label>
                <input
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(event) => onProfileChange({ ...profile, phone: event.target.value })}
                    readOnly={!isEditing}
                    className="h-10 min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 p-2 text-slate-100"
                    maxLength={30}
                    placeholder="Telefonnummer..."
                />
            </div>
            <div className="flex items-center">
                <label className="mr-2 text-slate-300">E-post:</label>
                <input
                    type="text"
                    value={profile.email}
                    readOnly
                    className="h-10 min-w-0 flex-1 rounded border border-slate-600 bg-slate-700 p-2 text-slate-400"
                />
            </div>
            {isEditing && (
                <button type="button" onClick={onSave} className="mt-4 rounded bg-blue-500 p-2 text-white">
                    Uppdatera användaruppgifter
                </button>
            )}
        </div>
    );
}
