import imageCompression from 'browser-image-compression';

export async function compressProductImage(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<File> {
  const options = {
    maxSizeMB: 2,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
    onProgress: (progress: number) => {
      if (onProgress) onProgress(progress);
    }
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Image compressed from ${file.size / 1024 / 1024}MB to ${compressedFile.size / 1024 / 1024}MB`);
    return compressedFile;
  } catch (error) {
    console.error('Compression failed, using original file:', error);
    return file; // Fallback to original if compression fails
  }
}

export function validateImageSize(file: File, maxMB: number = 15): boolean {
  return file.size <= maxMB * 1024 * 1024;
}
