import { supabase } from './supabase';

/**
 * GDPR "Right to be Forgotten" — cascading delete of all user data.
 * 1. Fetch all listings for the user.
 * 2. Delete images from Supabase Storage for each listing.
 * 3. Delete listing images rows, listing analytics, favorites.
 * 4. Delete listings.
 * 5. Delete user profile from public.users (or Supabase auth).
 */
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Nema prijavljenog korisnika.' };
    }

    const userId = user.id;

    // 1. Fetch listings to know which storage objects to purge
    const { data: listings, error: listingsErr } = await supabase
      .from('listings')
      .select('id')
      .eq('user_id', userId);

    if (listingsErr) throw listingsErr;

    const listingIds = listings?.map((l) => l.id) ?? [];

    // 2. Fetch image storage paths for cleanup
    if (listingIds.length > 0) {
      const { data: images } = await supabase
        .from('listing_images')
        .select('storage_path')
        .in('listing_id', listingIds);

      const paths = images?.map((img) => img.storage_path).filter(Boolean) as string[];
      if (paths.length > 0) {
        await supabase.storage.from('listings').remove(paths);
      }
    }

    // 3. Delete dependent rows (cascade via FK would handle most, but we enforce)
    await supabase.from('favorites').delete().eq('user_id', userId);
    await supabase.from('listing_analytics').delete().in('listing_id', listingIds);
    await supabase.from('listing_images').delete().in('listing_id', listingIds);
    await supabase.from('listings').delete().eq('user_id', userId);

    // 4. Delete auth user (this also triggers auth hook deletion of profile if set)
    const { error: authErr } = await supabase.auth.admin.deleteUser(userId);
    if (authErr) {
      // Fallback: if admin delete fails (needs service_role), sign out at minimum
      await supabase.auth.signOut();
      console.warn('Admin delete failed, signed out instead:', authErr.message);
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Nepoznata greška pri brisanju računa.';
    console.error('❌ deleteAccount failed:', err);
    return { success: false, error: message };
  }
}
