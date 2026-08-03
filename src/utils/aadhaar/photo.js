/**
 * Converts raw photo byte array into a browser-displayable Data URL
 */
export async function decodePhotoToDataUrl(bytes) {
  if (!bytes || bytes.length === 0) return null;

  try {
    // Check magic bytes for standard JPEG (0xFF 0xD8) vs JP2 (0x00 0x00 0x00 0x0C or 0xFF 0x4F)
    const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8;
    
    if (isJpeg) {
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    }

    // Default Blob fallback for browser rendering engine
    const blob = new Blob([bytes], { type: 'image/jp2' });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Error decoding photo bytes:', e);
    return null;
  }
}
