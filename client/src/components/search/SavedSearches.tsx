import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Bell, BellOff, X } from 'lucide-react';
import {
  hashSearch, saveSearch, deleteSearch, listSaved, newMatches, markVisited,
  toggleEmailAlert, type SavedSearch,
} from '../../lib/savedSearches';

interface Props {
  // Current feed URL ('/pretraga?make=BMW&...') and result IDs
  currentUrl: string;
  currentIds: string[];
  // Human-readable label generated from active filters by the parent
  label: string;
  categorySlug?: string;
}

// Saved-search bar — lives at the top of the feed.
//   • "Spremi pretragu" button on the right when current URL is non-trivial
//   • horizontal strip of saved searches with red pulse + count when new matches arrive
//   • each chip: click navigates, bell toggles email alert (Phase 1.b: actually send),
//     X deletes
export const SavedSearchesBar = ({ currentUrl, currentIds, label, categorySlug }: Props) => {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = () => setItems(listSaved());
    refresh();
    window.addEventListener('vozila:saved-searches-updated', refresh);
    return () => window.removeEventListener('vozila:saved-searches-updated', refresh);
  }, []);

  const currentId = hashSearch(currentUrl);
  const isSaved = items.some((s) => s.id === currentId);

  // When the feed renders with this search active, snapshot the current IDs
  // so the pulse on this saved search's chip clears.
  useEffect(() => {
    if (isSaved && currentIds.length > 0) markVisited(currentId, currentIds);
  }, [isSaved, currentId, currentIds]);

  const onSave = () => {
    saveSearch(currentUrl, label, currentIds, categorySlug);
  };

  if (items.length === 0 && !label) return null;

  return (
    <div className="mb-6 px-4 sm:px-0">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Save current search button — only shown if URL has filters */}
        {label && (
          <button
            onClick={isSaved ? () => deleteSearch(currentId) : onSave}
            className={`inline-flex items-center gap-2 px-3 py-2 text-[10px] font-light uppercase tracking-[0.25em] border transition-colors ${
              isSaved
                ? 'border-primary text-primary bg-primary/10'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {isSaved ? 'Spremljeno' : 'Spremi pretragu'}
          </button>
        )}

        {/* Saved searches strip */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            {items.map((s) => {
              const fresh = newMatches(s.id, currentIds).length;
              const isActive = s.id === currentId;
              return (
                <span
                  key={s.id}
                  className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-light uppercase tracking-[0.2em] border transition-colors flex-shrink-0 ${
                    isActive ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  }`}
                >
                  <Link to={s.url} className="inline-flex items-center gap-2">
                    {s.label}
                    {fresh > 0 && !isActive && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-medium text-primary-foreground bg-primary tabular-nums animate-pulse">
                        +{fresh}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={(e) => { e.preventDefault(); toggleEmailAlert(s.id); }}
                    title={s.emailAlert ? 'Isključi email obavijesti' : 'Uključi email obavijesti'}
                    className={`p-0.5 transition-colors ${s.emailAlert ? 'text-primary' : 'opacity-50 hover:opacity-100'}`}
                  >
                    {s.emailAlert ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); deleteSearch(s.id); }}
                    title="Obriši"
                    className="p-0.5 opacity-50 hover:opacity-100 hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper used by ListingFeed to build a short Croatian label from active filters.
export function buildLabel(filters: Record<string, any>, categoryName?: string): string {
  const parts: string[] = [];
  if (categoryName) parts.push(categoryName);
  if (filters.make) parts.push(String(filters.make));
  if (filters.model) parts.push(String(filters.model));
  if (filters.year_min || filters.year_max) {
    parts.push(`${filters.year_min || ''}-${filters.year_max || ''}`.replace(/^-|-$/g, ''));
  }
  if (filters.price_min || filters.price_max) {
    if (filters.price_max) parts.push(`do ${(filters.price_max as number).toLocaleString('hr-HR')}€`);
    else if (filters.price_min) parts.push(`od ${(filters.price_min as number).toLocaleString('hr-HR')}€`);
  }
  if (filters.fuel) parts.push(String(filters.fuel));
  return parts.join(' · ').slice(0, 60);
}
