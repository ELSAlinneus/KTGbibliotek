"use client";

import { useMemo, useState } from "react";
import type { Area } from "react-easy-crop";
import ImageCropDialog from "@/components/imgUploader/ImageCropDialog";
import ImageDropzone from "@/components/imgUploader/ImageDropzone";
import ImagePreview from "@/components/imgUploader/ImagePreview";
import type { ImgUploaderProps } from "@/components/imgUploader/types";
import { getCroppedBlob, isAllowedImageType, readFileAsDataUrl } from "@/components/imgUploader/utils";

export default function ImgUploader({
  value,
  onChange,
  aspect = 1,
  round,
  sizeLimit,
  disabled,
  className,
  label,
}: ImgUploaderProps) {
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);

  const imageToDisplay = useMemo(() => value ?? "", [value]);

  const handleSelectFile = async (file: File) => {
    setStatusMessage("");

    if (!isAllowedImageType(file)) {
      setStatusMessage("Invalid file type.");
      return;
    }

    if (sizeLimit && file.size > sizeLimit) {
      setStatusMessage("File is too large.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditorImage(dataUrl);
      setEditorOpen(true);
    } catch {
      setStatusMessage("Could not read file.");
    }
  };

  const handleSaveCrop = async (cropAreaPixels: Area) => {
    if (!editorImage) {
      return;
    }

    try {
      const blob = await getCroppedBlob(editorImage, {
        x: Math.round(cropAreaPixels.x),
        y: Math.round(cropAreaPixels.y),
        width: Math.round(cropAreaPixels.width),
        height: Math.round(cropAreaPixels.height),
      });
      const previewUrl = URL.createObjectURL(blob);
      onChange?.({ blob, previewUrl });
      setEditorOpen(false);
    } catch {
      setStatusMessage("Could not crop image.");
    }
  };

  const clearImage = () => {
    onChange?.(null);
    setStatusMessage("");
  };

  const openEditor = () => {
    if (!imageToDisplay) {
      return;
    }
    setEditorImage(imageToDisplay);
    setEditorOpen(true);
  };


  return (
    <div>


      {statusMessage ? (
        <p className="mt-2 text-sm text-red-700">{statusMessage}</p>
      ) : null}

        {imageToDisplay ? (
            <ImagePreview
            image={imageToDisplay}
            round={round}
            disabled={disabled}
            onEdit={openEditor}
            onClear={clearImage}
            />
        ) : (      
        <ImageDropzone
            onSelectFile={handleSelectFile}
            disabled={disabled}
            label={label}
            className={className}
        />
      )} 

      <ImageCropDialog
        open={editorOpen}
        imageSrc={editorImage}
        aspect={aspect}
        round={round}
        onCancel={() => setEditorOpen(false)}
        onSave={handleSaveCrop}
      />
    </div>
  );
}
