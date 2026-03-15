"use client";

import { useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

type ImageCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  aspect: number;
  round?: boolean;
  onCancel: () => void;
  onSave: (cropAreaPixels: Area) => void;
};

export default function ImageCropDialog({
  open,
  imageSrc,
  aspect,
  round,
  onCancel,
  onSave,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  if (!open || !imageSrc) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-xl">
        <div className="relative h-[420px] w-full overflow-hidden rounded bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={round ? "round" : "rect"}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <label htmlFor="crop-zoom" className="text-sm text-gray-700">
            Zoom
          </label>
          <input
            id="crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => croppedAreaPixels && onSave(croppedAreaPixels)}
            className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white"
          >
            Crop
          </button>
        </div>
      </div>
    </div>
  );
}