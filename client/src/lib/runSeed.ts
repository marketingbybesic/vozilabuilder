import { supabase } from './supabase';
import { seedListings } from './seedData';

export interface SeedResult {
  success: boolean;
  inserted: number;
  errors: string[];
}

export const runSeed = async (): Promise<SeedResult> => {
  const errors: string[] = [];
  let inserted = 0;

  // First resolve category_id for 'osobni-automobili'
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'osobni-automobili')
    .single();

  if (catError || !category) {
    return {
      success: false,
      inserted: 0,
      errors: ['Kategorija "osobni-automobili" nije pronađena. Molimo kreirajte kategorije prije seed-a.'],
    };
  }

  for (const listing of seedListings) {
    try {
      // Insert the listing row
      const { data: newListing, error: listingError } = await supabase
        .from('listings')
        .insert({
          title: listing.title,
          price: listing.price,
          currency: listing.currency,
          status: listing.status,
          listing_type: listing.listing_type,
          location: listing.location,
          description: listing.description,
          contact_phone: listing.contact_phone,
          contact_email: listing.contact_email,
          attributes: listing.attributes,
          category_id: category.id,
        })
        .select('id')
        .single();

      if (listingError) {
        errors.push(`Listing "${listing.title}": ${listingError.message}`);
        continue;
      }

      // Insert images if listing was created
      if (newListing?.id && listing.images.length > 0) {
        const imageRows = listing.images.map((url, idx) => ({
          listing_id: newListing.id,
          url,
          is_primary: idx === 0,
          sort_order: idx,
        }));

        const { error: imgError } = await supabase
          .from('listing_images')
          .insert(imageRows);

        if (imgError) {
          errors.push(`Images for "${listing.title}": ${imgError.message}`);
        }
      }

      inserted++;
    } catch (err: any) {
      errors.push(`Listing "${listing.title}": ${err?.message || 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    inserted,
    errors,
  };
};
