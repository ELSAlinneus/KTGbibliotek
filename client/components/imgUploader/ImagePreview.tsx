"use client";

import Image from "next/image";

type ImagePreviewProps = {
    image: string;
    round?: boolean;
    disabled?: boolean;
    onEdit: () => void;
    onClear: () => void;
};

export default function ImagePreview({
    image,
    round,
    disabled,
    onEdit,
    onClear,
}: ImagePreviewProps) {

    return (
        <div className="relative mx-auto h-48 w-48 overflow-hidden">
            <Image
                src={image}
                alt="Selected preview"
                fill
                sizes="192px"
                unoptimized
                className={`object-cover ${round ? "rounded-full" : "rounded"}`}
            />
            <>
                <button
                    type="button"
                    onClick={onClear}
                    disabled={disabled}
                    className="absolute right-1 top-1 disabled:opacity-60"
                    aria-label="Clear image"
                >
                ✕
                </button>
                <button
                    type="button"
                    onClick={onEdit}
                    disabled={disabled}
                    className="absolute right-1 bottom-1 disabled:opacity-60"
                    aria-label="Edit image"
                >
                <i className="fa fa-pen-to-square"></i>
                </button>
            </>
        </div>
    );
}