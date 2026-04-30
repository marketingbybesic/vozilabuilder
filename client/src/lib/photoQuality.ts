// Lightweight client-side photo quality grader. No deps.
// Scores: resolution, brightness, contrast variance, file size.
// Returns up to 3 actionable tips per photo so the seller can re-shoot.

export interface PhotoVerdict {
  score: number;     // 0-100
  band: 'A' | 'B' | 'C';
  tips: string[];    // human-readable Croatian tips
}

export async function gradePhoto(file: File): Promise<PhotoVerdict> {
  const tips: string[] = [];
  let score = 100;

  if (!file.type.startsWith('image/')) {
    return { score: 0, band: 'C', tips: ['Datoteka nije slika.'] };
  }

  // 1) File size check — very small files are usually low-res or over-compressed
  if (file.size < 60_000) {
    score -= 20;
    tips.push('Slika je vrlo mala — preporučujemo barem 1280px širinu.');
  }

  // 2) Read pixel data to inspect resolution + brightness + contrast
  const bitmap = await fileToBitmap(file).catch(() => null);
  if (!bitmap) return { score: Math.max(score, 30), band: 'C', tips: ['Ne mogu pročitati sliku.'] };
  const width = (bitmap as any).width ?? (bitmap as any).naturalWidth;
  const height = (bitmap as any).height ?? (bitmap as any).naturalHeight;

  if (width < 1024 || height < 768) {
    score -= 25;
    tips.push(`Niska rezolucija (${width}×${height}). Snimite barem 1280×960.`);
  }

  // Sample down to 64×64 for fast pixel stats
  const SAMPLE = 64;
  const c = document.createElement('canvas');
  c.width = SAMPLE; c.height = SAMPLE;
  const ctx = c.getContext('2d');
  if (!ctx) return finalize(score, tips);
  ctx.drawImage(bitmap as any, 0, 0, SAMPLE, SAMPLE);
  const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);

  let sum = 0, sumSq = 0;
  const N = SAMPLE * SAMPLE;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    sum += lum;
    sumSq += lum * lum;
  }
  const mean = sum / N;             // 0..255
  const variance = sumSq / N - mean * mean;
  const stddev = Math.sqrt(Math.max(0, variance));

  if (mean < 60) {
    score -= 25;
    tips.push('Slika izgleda tamna — povećajte ekspoziciju ili snimite po danu.');
  } else if (mean > 220) {
    score -= 15;
    tips.push('Slika izgleda preeksponirana — smanjite svjetlinu ili izbjegavajte direktno sunce.');
  }
  if (stddev < 28) {
    score -= 18;
    tips.push('Niska razina detalja (kontrast). Provjerite je li slika zamućena ili je vozilo presjajno odsjajeno.');
  }

  return finalize(score, tips);
}

function finalize(score: number, tips: string[]): PhotoVerdict {
  score = Math.max(0, Math.min(100, score));
  const band: PhotoVerdict['band'] = score >= 80 ? 'A' : score >= 55 ? 'B' : 'C';
  return { score, band, tips: tips.slice(0, 3) };
}

async function fileToBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(file); } catch { /* fallthrough */ }
  }
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function gradeBatch(files: File[]): Promise<PhotoVerdict[]> {
  const out: PhotoVerdict[] = [];
  for (const f of files) {
    try { out.push(await gradePhoto(f)); }
    catch { out.push({ score: 50, band: 'B', tips: [] }); }
  }
  return out;
}
