const allowedTypes = [
  "image/png",
  "image/gif",
  "image/jpg",
  "image/jpeg",
  "image/heic",
  "image/webp",
];

export const isAllowedImageType = (file: File) => {
  return allowedTypes.includes(file.type.toLowerCase());
};

export const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
};

const createImage = (url: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Image load failed")));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
};

export const getCroppedBlob = (
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number },
  maxSide = 160
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      const image = await createImage(imageSrc);
      const cropWidth = Math.max(1, crop.width);
      const cropHeight = Math.max(1, crop.height);
      const scale = Math.min(1, maxSide / Math.max(cropWidth, cropHeight));
      const outputWidth = Math.max(1, Math.round(cropWidth * scale));
      const outputHeight = Math.max(1, Math.round(cropHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Could not create canvas context"));
      ctx.drawImage(image, crop.x, crop.y, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not create blob"));
      }, "image/jpeg", 0.75);
    } catch (e) {
      reject(e);
    }
  });
};