import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Trending searches — pulls the top 12 (make, model) combos from active
// listings and renders as searchable chips. Drives discovery for indecisive
// buyers and helps SEO for long-tail brand+model queries.
export const TrendingSearches = () => {
  const [chips, setChips] = useState<{ label: string; href: string; count: number }[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await supabase
          .from('listings')
          .select('attributes, categories!inner(slug)')
          .eq('status', 'active')
          .limit(500);

        const counts: Record<string, { count: number; make: string; model: string; slug: string }> = {};
        for (const r of (data || []) as any[]) {
          const a = r.attributes || {};
          if (!a.make) continue;
          const slug = r.categories?.slug || 'pretraga';
          const key = `${slug}::${a.make}::${a.model || ''}`;
          if (!counts[key]) counts[key] = { count: 0, make: a.make, model: a.model || '', slug };
          counts[key].count += 1;
        }

        const sorted = Object.values(counts)
          .filter((c) => c.count >= 1)
          .sort((a, b) => b.count - a.count)
          .slice(0, 12)
          .map((c) => ({
            label: c.model ? `${c.make} ${c.model}` : c.make,
            href: `/${c.slug === 'pretraga' ? 'pretraga' : c.slug}?make=${encodeURIComponent(c.make)}${c.model ? `&model=${encodeURIComponent(c.model)}` : ''}`,
            count: c.count,
          }));
        setChips(sorted);
      } catch {
        setChips([]);
      }
    };
    run();
  }, []);

  if (chips.length === 0) return null;

  return (
    <section className="py-12 lg:py-16 px-6 sm:px-10 lg:px-14 max-w-[1480px] mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[10px] font-light uppercase tracking-[0.35em] text-primary mb-3 inline-flex items-center gap-2">
            <TrendingUp className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
            Trending
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-light uppercase tracking-tight text-foreground">
            Najtraženije pretrage
          </h2>
        </div>
        <span className="text-[10px] font-light uppercase tracking-[0.3em] text-muted-foreground tabular-nums hidden sm:block">
          {String(chips.length).padStart(2, '0')} izbora
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {chips.map((c) => (
          <Link
            key={c.href}
            to={c.href}
            className="group inline-flex items-center gap-2 px-3.5 py-2 border border-border text-foreground text-[10px] font-light uppercase tracking-[0.2em] hover:border-primary hover:text-primary transition-colors"
          >
            <Search className="w-3 h-3 opacity-60 group-hover:opacity-100" strokeWidth={1.5} aria-hidden="true" />
            <span>{c.label}</span>
            <span className="text-[9px] tabular-nums opacity-50 group-hover:opacity-80">
              {c.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
