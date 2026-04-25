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
  attributes: z.record(z.string(), z.any()).optional().default({}),

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

  // Status matches DB enum: draft | active | sold
  status: z
    .enum(['draft', 'active', 'sold'])
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

/**
 * Profile / Business Data Schema
 * Validates user profile fields including Croatian OIB (VAT ID)
 */
export const profileSchema = z.object({
  userType: z.enum(['private', 'business']).default('private'),
  vatId: z
    .string()
    .regex(/^\d{11}$/, 'OIB mora sadržavati točno 11 znamenki')
    .optional(),
  companyName: z.string().min(2, 'Naziv tvrtke je obavezan').optional(),
  officeAddress: z.string().min(5, 'Adresa ureda je obavezna').optional(),
  businessPhone: z
    .string()
    .regex(/^[+]?[\d\s()-]+$/, 'Neispravan format telefona')
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
