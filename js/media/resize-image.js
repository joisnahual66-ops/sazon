// Turns a photo picked on the phone into two small images, entirely on the device (D-020):
//   display   — longest side ≈ 1200 px
//   thumbnail — longest side ≈ 300 px
// Aspect ratio is kept, camera rotation is applied, and the original file is not kept.
// Uses only built-in browser features (no extra library).

const DISPLAY_MAX = 1200;
const THUMB_MAX = 300;
const DISPLAY_QUALITY = 0.82;
const THUMB_QUALITY = 0.75;

export class UnsupportedImageError extends Error {}

function fit(width, height, max) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// WebP is smallest; if the browser can't produce it, fall back to JPEG.
async function encode(canvas, quality) {
  const webp = await canvasToBlob(canvas, 'image/webp', quality);
  if (webp && webp.type === 'image/webp') return webp;
  return canvasToBlob(canvas, 'image/jpeg', quality);
}

async function scaled(bitmap, max, quality) {
  const size = fit(bitmap.width, bitmap.height, max);
  let source = bitmap;
  try {
    // High-quality browser downscaling when available.
    source = await createImageBitmap(bitmap, { resizeWidth: size.width, resizeHeight: size.height, resizeQuality: 'high' });
  } catch {
    source = bitmap;
  }
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, size.width, size.height);
  if (source !== bitmap && source.close) source.close();
  const blob = await encode(canvas, quality);
  if (!blob) throw new UnsupportedImageError('Could not encode image');
  return { blob, ...size };
}

// → { display, thumb, width, height, originalBytes }
export async function processPhoto(file) {
  let bitmap;
  try {
    // 'from-image' applies the camera's rotation information.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new UnsupportedImageError('This photo format can’t be opened here');
  }
  try {
    const display = await scaled(bitmap, DISPLAY_MAX, DISPLAY_QUALITY);
    const thumb = await scaled(bitmap, THUMB_MAX, THUMB_QUALITY);
    return {
      display: display.blob,
      thumb: thumb.blob,
      width: display.width,
      height: display.height,
      originalBytes: file.size
    };
  } finally {
    if (bitmap.close) bitmap.close();
  }
}
