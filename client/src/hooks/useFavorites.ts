import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'vozila_guest_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites on mount (guest = localStorage, auth = DB)
  useEffect(() => {
    const loadFavorites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Auth mode: load from DB
        const { data } = await supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', session.user.id);
        const ids = data?.map((f) => f.listing_id) || [];
        setFavorites(ids);
      } else {
        // Guest mode: load from localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const ids = raw ? JSON.parse(raw) : [];
          setFavorites(Array.isArray(ids) ? ids : []);
        } catch {
          setFavorites([]);
        }
      }
      setLoading(false);
    };
    loadFavorites();
  }, []);

  const isFavorite = useCallback(
    (listingId: string) => favorites.includes(listingId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (listingId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const isAuth = !!session?.user;

      if (isAuth) {
        const userId = session.user.id;
        if (favorites.includes(listingId)) {
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('listing_id', listingId);
          setFavorites((prev) => prev.filter((id) => id !== listingId));
        } else {
          await supabase.from('favorites').insert({ user_id: userId, listing_id: listingId });
          setFavorites((prev) => [...prev, listingId]);
        }
      } else {
        // Guest mode: localStorage
        let next: string[];
        if (favorites.includes(listingId)) {
          next = favorites.filter((id) => id !== listingId);
        } else {
          next = [...favorites, listingId];
        }
        setFavorites(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    },
    [favorites]
  );

  /**
   * Sync localStorage favorites to DB after login.
   * Call this once immediately after successful authentication.
   */
  const syncLocalFavorites = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const localIds: string[] = JSON.parse(raw);
      if (!Array.isArray(localIds) || localIds.length === 0) return;

      // Insert only favorites that don't already exist
      const { data: existing } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', session.user.id)
        .in('listing_id', localIds);

      const existingIds = new Set(existing?.map((r) => r.listing_id) || []);
      const toInsert = localIds
        .filter((id) => !existingIds.has(id))
        .map((listing_id) => ({ user_id: session.user.id, listing_id }));

      if (toInsert.length > 0) {
        await supabase.from('favorites').insert(toInsert);
      }

      // Refresh favorites from DB
      const { data } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', session.user.id);
      const ids = data?.map((f) => f.listing_id) || [];
      setFavorites(ids);

      // Clear localStorage after successful sync
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently fail sync; keep localStorage for retry
    }
  }, []);

  return { favorites, loading, isFavorite, toggleFavorite, syncLocalFavorites };
}
