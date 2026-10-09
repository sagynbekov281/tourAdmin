const MAX_IMAGE_BYTES = 350 * 1024;

export async function compressImage(file) {
  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
    let width = Math.max(1, Math.round(image.width * scale));
    let height = Math.max(1, Math.round(image.height * scale));
    let quality = 0.86;

    while (true) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Не удалось обработать фотографию');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (!blob) throw new Error('Не удалось обработать фотографию');
      if (blob.size <= MAX_IMAGE_BYTES) {
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Не удалось прочитать обработанную фотографию'));
          reader.readAsDataURL(blob);
        });
      }

      if (Math.max(width, height) < 320) break;
      if (quality > 0.55) quality -= 0.1;
      else {
        width = Math.round(width * 0.85);
        height = Math.round(height * 0.85);
        quality = 0.8;
      }
    }
    throw new Error('Не удалось уменьшить фотографию до допустимого размера');
  } finally {
    image.close();
  }
}
