// Client-side image watermark — Canvas-based, no deps, ~10ms per photo.
// Applied during seller upload pipeline before sending to Supabase Storage.
//
// Layout:
//   • diagonal repeated text watermark across whole image (very low opacity)
//   • bottom-right "vozila.hr" badge (higher opacity)
// Both scale with image size so small thumbs and 4K originals look right.

export async function watermarkFile(file: File, options: {
  text?: string;
  opacity?: number;
  badgeOpacity?: number;
  outputType?: string;
  quality?: number;
} = {}): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  const text = options.text ?? 'vozila.hr';
  const opacity = options.opacity ?? 0.07;
  const badgeOpacity = options.badgeOpacity ?? 0.55;
  const outputType = options.outputType ?? (file.type === 'image/png' ? 'image/png' : 'image/jpeg');
  const quality = options.quality ?? 0.88;

  const bitmap = await fileToBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  // 1) draw original
  ctx.drawImage(bitmap, 0, 0);

  // 2) diagonal repeated watermark — very subtle
  const fontSize = Math.max(14, Math.round(canvas.width / 30));
  ctx.save();
  ctx.fillStyle = `rgba(255,255,255,${opacity})`;
  ctx.font = `300 ${fontSize}px "Exo 2", "Helvetica Neue", Arial, sans-serif`;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 6);
  const stepX = fontSize * 8;
  const stepY = fontSize * 3.5;
  for (let y = -canvas.height; y < canvas.height; y += stepY) {
    for (let x = -canvas.width; x < canvas.width; x += stepX) {
      ctx.fillText(text.toUpperCase(), x, y);
    }
  }
  ctx.restore();

  // 3) bottom-right badge with translucent rectangle backdrop
  const badgePad = Math.max(6, Math.round(canvas.width / 200));
  const badgeFont = Math.max(10, Math.round(canvas.width / 60));
  ctx.font = `400 ${badgeFont}px "Exo 2", "Helvetica Neue", Arial, sans-serif`;
  const w = ctx.measureText(text).width + badgePad * 2;
  const h = badgeFont + badgePad * 1.4;
  const x = canvas.width - w - badgePad * 2;
  const y = canvas.height - h - badgePad * 2;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = `rgba(255,255,255,${badgeOpacity + 0.35})`;
  ctx.textBaseline = 'top';
  ctx.fillText(text, x + badgePad, y + badgePad * 0.7);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), outputType, quality)
  );

  const newName = file.name.replace(/(\.[^.]+)?$/, '-wm$1') || 'image-wm.jpg';
  return new File([blob], newName, { type: outputType, lastModified: Date.now() });
}

async function fileToBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(file); } catch { /* fall through */ }
  }
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Convenience helper for batch upload pipelines
export async function watermarkBatch(files: File[]): Promise<File[]> {
  const out: File[] = [];
  for (const f of files) {
    try { out.push(await watermarkFile(f)); }
    catch { out.push(f); }
  }
  return out;
}
