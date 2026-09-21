import ImgUploader from "@/components/imgUploader/imgUploader";
import BookImagePreview from "@/components/books/bookImagePreview";

type BookInfoImagesProps = {
    title: string;
    imageUrl: string;
    backCoverImageUrl: string;
    isOwner: boolean;
    onImageChange: (result: { blob: Blob; previewUrl: string } | null) => void;
    onBackCoverImageChange: (result: { blob: Blob; previewUrl: string } | null) => void;
    onRemoveImage: () => void;
    onRemoveBackCoverImage: () => void;
};

function ImageUploader({ label, onChange }: { label: string; onChange: BookInfoImagesProps["onImageChange"] }) {
    return (
        <div className="relative h-72 w-48 overflow-hidden rounded-lg border-2 border-dashed border-white/70 bg-black/45">
            <ImgUploader
                value=""
                onChange={onChange}
                label={label}
                aspect={2 / 3}
                className="flex h-full w-full items-center justify-center px-3 py-2 text-center text-sm text-white transition"
            />
        </div>
    );
}

export default function BookInfoImages({
    title,
    imageUrl,
    backCoverImageUrl,
    isOwner,
    onImageChange,
    onBackCoverImageChange,
    onRemoveImage,
    onRemoveBackCoverImage,
}: BookInfoImagesProps) {
    return (
        <div className="flex shrink-0 gap-4">
            {imageUrl ? (
                <BookImagePreview 
                    imageUrl={imageUrl} 
                    alt={title} 
                    label="framsida" 
                    onRemove={isOwner ? onRemoveImage : undefined} 
                />
            ) : isOwner ? (
                <ImageUploader label="Lägg till omslagsbild" onChange={onImageChange} />
            ) : null}
            {backCoverImageUrl ? (
                <BookImagePreview
                    imageUrl={backCoverImageUrl}
                    alt={`${title}, baksida`}
                    label="baksida"
                    onRemove={isOwner ? onRemoveBackCoverImage : undefined}
                />
            ) : isOwner ? (
                <ImageUploader label="Lägg till baksida" onChange={onBackCoverImageChange} />
            ) : null}
        </div>
    );
}