function readImageDimensions(file: File): Promise<{ width: number; height: number; src: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem selecionada."));
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : null;
      if (!src) {
        reject(new Error("Imagem invalida."));
        return;
      }

      const image = new Image();
      image.onerror = () => reject(new Error("Nao foi possivel processar a imagem."));
      image.onload = () => {
        resolve({ width: image.naturalWidth, height: image.naturalHeight, src });
      };
      image.src = src;
    };

    reader.readAsDataURL(file);
  });
}

export async function optimizeImageForUpload(
  file: File,
  options?: {
    maxDimension?: number;
    quality?: number;
    convertTo?: "image/webp" | "image/jpeg";
  }
): Promise<File> {
  const maxDimension = options?.maxDimension ?? 1200;
  const quality = options?.quality ?? 0.82;
  const convertTo = options?.convertTo ?? "image/webp";

  if (!file.type.startsWith("image/")) {
    return file;
  }

  const { width, height, src } = await readImageDimensions(file);
  const largestSide = Math.max(width, height);

  if (largestSide <= maxDimension && file.size <= 900 * 1024) {
    return file;
  }

  const scale = Math.min(1, maxDimension / largestSide);
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Nao foi possivel preparar a imagem para envio."));
    image.src = src;
  });

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, convertTo, quality);
  });

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const extension = convertTo === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.${extension}`, {
    type: convertTo,
    lastModified: Date.now()
  });
}
