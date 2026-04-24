import { z } from 'zod';

/**
 * Base Listing Schema for Vozila.hr
 * Enforces English keys for DB isolation
 * Maps to Supabase listings table structure
 */
export const listingSchema = z.object({
  // Core fields (top-level in DB)
  title: z
    .string()
    .min(5, 'Naslov mora imati najmanje 5 znakova')
    .max(100, 'Naslov može imati najviše 100 znakova')
    .trim(),

  price: z
    .number()
    .min(0, 'Cijena ne može biti negativna'),

  currency: z
    .string()
    .default('€')
    .optional(),

  description: z
    .string()
    .min(20, 'Opis mora imati najmanje 20 znakova')
    .max(5000, 'Opis može imati najviše 5000 znakova')
    .trim()
    .optional(),

  categoryId: z
    .string()
    .min(1, 'Kategorija je obavezna'),

  // Dynamic attributes (JSONB in DB)
  // Will be strictly typed per category in next phase
  attributes: z.record(z.string(), z.any()).default({}),

  // Location fields
  location: z
    .string()
    .min(2, 'Lokacija je obavezna')
    .optional(),

  // Contact fields
  contactName: z
    .string()
    .min(2, 'Ime je obavezno')
    .optional(),

  contactPhone: z
    .string()
    .regex(/^[+]?[\d\s()-]+$/, 'Neispravan format telefona')
    .optional(),

  contactEmail: z
    .string()
    .email('Neispravna email adresa')
    .optional(),

  // Status (will be set to 'draft' initially)
  status: z
    .enum(['draft', 'active', 'sold', 'archived'])
    .default('draft'),
});

export type ListingFormData = z.infer<typeof listingSchema>;

/**
 * Car (Automobili) Attributes Schema
 * JSONB attributes for osobni-automobili category
 */
export const carAttributesSchema = z.object({
  make: z
    .string()
    .min(1, 'Marka je obavezna'),
  
  model: z
    .string()
    .min(1, 'Model je obavezan'),
  
  year: z
    .number()
    .min(1900, 'Godina mora biti najmanje 1900')
    .max(2027, 'Godina ne može biti veća od 2027'),
  
  mileage: z
    .number()
    .min(0, 'Kilometraža ne može biti negativna'),
  
  fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid'], {
    message: 'Odaberite tip goriva'
  }),
  
  transmission: z.enum(['Manual', 'Automatic'], {
    message: 'Odaberite tip mjenjača'
  }),
});

export type CarAttributes = z.infer<typeof carAttributesSchema>;

/**
 * Category-specific attribute schemas
 * Map category slugs to their validation schemas
 */
export const categoryAttributeSchemas = {
  'osobni-automobili': carAttributesSchema,
  // Additional category schemas will be added in future phases
};
