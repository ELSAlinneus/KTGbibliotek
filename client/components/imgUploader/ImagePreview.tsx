"use client";

import Image from "next/image";

type ImagePreviewProps = {
    image: string;
    round?: boolean;
    disabled?: boolean;
    className?: string;
    onEdit: () => void;
    onClear: () => void;
};

export default function ImagePreview({
    image,
    round,
    disabled,
    className,
    onEdit,
    onClear,
}: ImagePreviewProps) {

    const imageShape = round ? "rounded-full" : "rounded";

    return (
        <div className={`relative mx-auto ${className ?? "h-72 w-48"}`}>
            <div className={`absolute inset-0 overflow-hidden ${imageShape}`}>
            <Image
                src={image}
                alt="Selected preview"
                fill
                sizes="192px"
                unoptimized
                className="object-cover"
            />
            </div>
            <>
                <button
                    type="button"
                    onClick={onClear}
                    disabled={disabled}
                    className="absolute right-2 top-0 z-10 font-bold text-2xl disabled:opacity-60"
                    aria-label="Clear image"
                >
                ✕
                </button>
                <button
                    type="button"
                    onClick={onEdit}
                    disabled={disabled}
                    className="absolute bottom-1 right-1 z-10 disabled:opacity-60"
                    aria-label="Edit image"
                >
                <i className="fa fa-pen-to-square"></i>
                </button>
            </>
        </div>
    );
}