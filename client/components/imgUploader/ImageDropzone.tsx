"use client";

import { ChangeEvent, DragEvent, useRef } from "react";

type ImageDropzoneProps = {
    onSelectFile: (file: File) => void;
    disabled?: boolean;
    label?: string;
    className?: string;
};

export default function ImageDropzone({
    onSelectFile,
    disabled,
    label,
    className,
}: ImageDropzoneProps) {
const fileInputRef = useRef<HTMLInputElement>(null);

const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        onSelectFile(file);
    }
    event.target.value = "";
};

const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) {
        return;
    }
    const file = event.dataTransfer.files?.[0];
    if (file) {
        onSelectFile(file);
    }
};

return (
    <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={className}
    >
        <p className="text-sm text-slate-400">{label ?? "Klicka eller drag en fil för att ladda upp."}</p>
        <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            disabled={disabled}
            accept=".png,.jpg,.jpeg,.gif,.heic,.webp"
            onChange={handleInput}
        />
    </div>
);
}