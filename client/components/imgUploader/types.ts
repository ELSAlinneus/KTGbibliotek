export type ImgUploaderProps = {
  value?: string | null;
  onChange?: (image: { blob: Blob; previewUrl: string } | null) => void;
  aspect?: number;
  round?: boolean;
  sizeLimit?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
};

export type CropAreaPixels = {
  width: number;
  height: number;
  x: number;
  y: number;
};