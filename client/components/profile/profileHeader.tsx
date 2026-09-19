import ImgUploader from "@/components/imgUploader/imgUploader";
import { PublicUserProfile } from "@/lib/types/Profile";

type ProfileHeaderProps = {
    profile: PublicUserProfile;
    onPhotoChange: (result: { blob: Blob; previewUrl: string } | null) => void;
};

export default function ProfileHeader({ profile, onPhotoChange }: ProfileHeaderProps) {
    return (
        <div className="m-4 flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-4">
            <ImgUploader
                value={profile.photoURL}
                onChange={onPhotoChange}
                round={true}
                className="h-48 w-48 cursor-pointer rounded-full border-2 border-dashed border-slate-600 p-13 text-center hover:border-slate-400"
            />
            <h1 className="text-center text-2xl font-bold text-slate-100">
                {profile.displayName || "Användarnamn saknas"}
            </h1>
        </div>
    );
}
