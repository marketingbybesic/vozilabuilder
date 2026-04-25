import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { query, transaction } from '../../db/index.js';

// ---------------------------------------------------------------------------
// Supabase Service Client (requires SERVICE_ROLE_KEY for bucket writes)
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Croatian CSV Header -> English DB Key mapping
// ---------------------------------------------------------------------------
const HEADER_MAP: Record<string, string> = {
  marka: 'make',
  model: 'model',
  cijena: 'price',
  'cijena (eur)': 'price',
  'cijena €': 'price',
  godište: 'year',
  godina: 'year',
  kilometraža: 'mileage',
  kilometraza: 'mileage',
  km: 'mileage',
  gorivo: 'fuel_type',
  'tip goriva': 'fuel_type',
  mjenjač: 'transmission',
  mjenjac: 'transmission',
  stanje: 'condition',
  lokacija: 'location_city',
  grad: 'location_city',
  snaga: 'power',
  'snaga (ks)': 'power',
  'snaga ks': 'power',
  karoserija: 'body_type',
  'tip karoserije': 'body_type',
  boja: 'color',
  vrata: 'doors',
  'broj vrata': 'doors',
  opis: 'description',
  naslov: 'title',
  slike: 'image_urls',
  'url slike': 'image_urls',
  'slike url': 'image_urls',
};

// ---------------------------------------------------------------------------
// Zod Schema for CSV row validation (after header mapping)
// ---------------------------------------------------------------------------
const csvRowSchema = z.object({
  title: z.string().min(1).optional(),
  make: z.string().min(1, 'Marka je obavezna'),
  model: z.string().min(1, 'Model je obavezan'),
  price: z.union([z.number().min(0), z.string()]).transform((v: string | number) => {
    if (typeof v === 'string') {
      const cleaned = v.replace(/[^0-9.]/g, '');
      const n = parseFloat(cleaned);
      return isNaN(n) ? 0 : n;
    }
    return v;
  }),
  year: z.union([z.number().min(1900).max(2030), z.string()])
    .transform((v: string | number) => (typeof v === 'string' ? parseInt(v.replace(/\D/g, '')) || 0 : v))
    .optional(),
  mileage: z.union([z.number().min(0), z.string()])
    .transform((v: string | number) => (typeof v === 'string' ? parseInt(v.replace(/\D/g, '')) || 0 : v))
    .optional(),
  fuel_type: z.string().optional(),
  transmission: z.string().optional(),
  condition: z.string().optional(),
  location_city: z.string().optional(),
  description: z.string().optional(),
  power: z.union([z.number(), z.string()])
    .transform((v: string | number) => (typeof v === 'string' ? parseInt(v.replace(/\D/g, '')) || undefined : v))
    .optional(),
  body_type: z.string().optional(),
  color: z.string().optional(),
  doors: z.union([z.number(), z.string()])
    .transform((v: string | number) => (typeof v === 'string' ? parseInt(v.replace(/\D/g, '')) || undefined : v))
    .optional(),
  image_urls: z.string().optional(),
});

export type ParsedCsvRow = z.infer<typeof csvRowSchema>;

// ---------------------------------------------------------------------------
// Image Scraper -> WebP -> Supabase Storage
// ---------------------------------------------------------------------------
async function fetchAndStoreImage(
  imageUrl: string,
  listingId: string,
  sortOrder: number,
  userId: string
): Promise<{ url: string; storagePath: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      console.warn(`⚠️  Failed to fetch image: ${imageUrl} (${response.status})`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to WebP via sharp
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 85, effort: 4 })
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    const filename = `${Date.now()}-${sortOrder}.webp`;
    const storagePath = `${userId}/${listingId}/gallery/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('listings')
      .upload(storagePath, webpBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn(`⚠️  Supabase upload failed for ${imageUrl}:`, uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from('listings').getPublicUrl(storagePath);
    return { url: data.publicUrl, storagePath };
  } catch (err: any) {
    console.warn(`⚠️  Image processing failed for ${imageUrl}:`, err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// CSV Parsing with Croatian Header Normalization
// ---------------------------------------------------------------------------
function normalizeHeader(header: string): string {
  const lowered = header.toLowerCase().trim();
  return HEADER_MAP[lowered] || lowered;
}

export function parseCsvBuffer(csvBuffer: Buffer): ParsedCsvRow[] {
  const records = parse(csvBuffer, {
    columns: (headers: string[]) => headers.map(normalizeHeader),
    skip_empty_lines: true,
    trim: true,
    cast: true,
    bom: true,
  });

  const validRows: ParsedCsvRow[] = [];

  for (const record of records) {
    const parseResult = csvRowSchema.safeParse(record);
    if (parseResult.success) {
      validRows.push(parseResult.data);
    } else {
      console.warn('⚠️  CSV row validation failed:', parseResult.error.flatten());
    }
  }

  return validRows;
}

// ---------------------------------------------------------------------------
// URL Guardrail: basic sanitization + protocol check
// ---------------------------------------------------------------------------
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 10) return false;
  if (!/^https?:\/\//i.test(trimmed)) return false;
  // Reject data-URIs, localhost, and private ranges
  if (trimmed.startsWith('data:')) return false;
  if (/https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+)/i.test(trimmed)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Core Sync Logic (Phase 1: immediate text insert)
// ---------------------------------------------------------------------------
export interface SyncResult {
  created: number;
  imagesQueued: number;
  errors: string[];
}

export async function syncInventoryFromCsv(
  csvBuffer: Buffer,
  userId: string,
  categoryId: string
): Promise<SyncResult> {
  const rows = parseCsvBuffer(csvBuffer);
  const result: SyncResult = { created: 0, imagesQueued: 0, errors: [] };
  const queuedImages: { listingId: string; urls: string[]; userId: string }[] = [];

  for (const row of rows) {
    try {
      await transaction(async (client) => {
        const topLevelCols = new Set([
          'title', 'make', 'model', 'price', 'year', 'mileage',
          'fuel_type', 'transmission', 'condition', 'location_city', 'description',
        ]);

        const attributes: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(row)) {
          if (value !== undefined && value !== null && value !== '' && !topLevelCols.has(key) && key !== 'image_urls') {
            attributes[key] = value;
          }
        }

        const title = row.title || `${row.make} ${row.model} ${row.year || ''}`.trim();

        const insertQuery = `
          INSERT INTO listings (
            user_id, category_id, title, description, price,
            make, model, year, mileage, fuel_type, transmission,
            condition, location_city, attributes, status, sync_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING id
        `;
        const insertValues = [
          userId,
          categoryId,
          title,
          row.description || null,
          row.price,
          row.make,
          row.model,
          row.year || null,
          row.mileage || null,
          row.fuel_type || null,
          row.transmission || null,
          row.condition || null,
          row.location_city || null,
          JSON.stringify(attributes),
          'active',
          'processing_images',
        ];

        const insertRes = await client.query(insertQuery, insertValues);
        const listingId: string = insertRes.rows[0].id;
        result.created++;

        const imageUrls = row.image_urls;
        if (imageUrls) {
          const urls = imageUrls
            .split(/[,;]/)
            .map((u: string) => u.trim())
            .filter(isValidImageUrl);

          if (urls.length > 0) {
            queuedImages.push({ listingId, urls, userId });
            result.imagesQueued += urls.length;
          }
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const msg = `Row (${row.make} ${row.model}) failed: ${message}`;
      console.error('❌', msg);
      result.errors.push(msg);
    }
  }

  // Phase 2: offload image processing to background (fire-and-forget)
  if (queuedImages.length > 0) {
    processImagesAsync(queuedImages).catch((err) => {
      console.error('❌ Background image processing failed:', err);
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Phase 2: Async image scraping (runs after HTTP response sent)
// ---------------------------------------------------------------------------
async function processImagesAsync(
  items: { listingId: string; urls: string[]; userId: string }[]
): Promise<void> {
  let processed = 0;
  let failed = 0;

  for (const item of items) {
    for (let i = 0; i < item.urls.length; i++) {
      try {
        const imgResult = await fetchAndStoreImage(item.urls[i], item.listingId, i, item.userId);
        if (imgResult) {
          await query(
            `INSERT INTO listing_images (listing_id, url, storage_path, sort_order, is_primary)
             VALUES ($1, $2, $3, $4, $5)`,
            [item.listingId, imgResult.url, imgResult.storagePath, i, i === 0]
          );
          processed++;
        } else {
          failed++;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`⚠️  Image ${i} failed for listing ${item.listingId}:`, message);
        failed++;
      }
    }

    // Mark listing as completed once all its images are attempted
    await query(
      `UPDATE listings SET sync_status = 'completed' WHERE id = $1`,
      [item.listingId]
    );
  }

  console.log(`🖼️  Background image processing done: ${processed} processed, ${failed} failed`);
}
