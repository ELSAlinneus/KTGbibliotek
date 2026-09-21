import Image from "next/image";
import { type MouseEvent, useEffect, useState } from "react";

type BookImagePreviewProps = {
    imageUrl: string;
    alt: string;
    label: string;
    onRemove?: () => void;
};

export default function BookImagePreview({ imageUrl, alt, label, onRemove }: BookImagePreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!isExpanded) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsExpanded(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isExpanded]);

    const removeImage = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onRemove?.();
    };

    return (
        <>
            <div className="relative h-72 w-48 overflow-hidden rounded-lg border border-slate-700 bg-slate-700">
                <button
                    type="button"
                    className="absolute inset-0 h-full w-full cursor-zoom-in"
                    onClick={() => setIsExpanded(true)}
                    aria-label={`Visa ${label} för ${alt} i större format`}
                >
                    <Image
                        fill
                        className="h-full w-full object-cover"
                        src={imageUrl}
                        alt={alt}
                        unoptimized
                    />
                </button>
                {onRemove && (
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-2 top-2 z-10 rounded-full border border-white/20 bg-slate-950/85 px-2 py-1 text-sm font-medium text-white shadow-lg transition hover:border-white/50 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                        aria-label={`Ta bort ${label}`}
                    >
                        ✕
                    </button>
                )}
            </div>
            {isExpanded && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6"
                    onClick={(event) => {
                        event.stopPropagation();
                        setIsExpanded(false);
                    }}
                >
                    <div className="relative max-h-full max-w-full" onClick={(event) => event.stopPropagation()}>
                        <Image
                            src={imageUrl}
                            alt={alt}
                            width={900}
                            height={1200}
                            className="max-h-[85vh] w-auto rounded-lg object-contain shadow-2xl"
                            unoptimized
                        />
                        <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            className="absolute right-2 top-2 rounded-full bg-slate-950/85 px-3 py-1 text-lg text-white hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            aria-label="Stäng bildvisning"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
