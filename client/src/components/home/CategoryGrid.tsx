import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { navigationMenu } from '../../config/taxonomy';
import { onImgError } from '../../lib/imageFallback';

const categoryImages: Record<string, string> = {
  'osobni-automobili': '/img/categories/cars.jpg',
  'motocikli': '/img/categories/motorcycles.jpg',
  'bicikli-romobili': '/img/categories/bicycles.jpg',
  'kombiji-laki-teretni': '/img/categories/light-commercial.jpg',
  'kamioni-teretna': '/img/categories/heavy-trucks.jpg',
  'gradevinski-strojevi': '/img/categories/construction.jpg',
  'poljoprivredni-strojevi': '/img/categories/agriculture.jpg',
  'kamperi-karavani': '/img/categories/campers.jpg',
  'plovila-nautika': '/img/categories/boats.jpg',
  'dijelovi-oprema': '/img/categories/parts.jpg',
  'usluge': '/img/categories/services.jpg',
  // Legacy fallback keys retained
  'slobodno-vrijeme': '/img/categories/leisure.jpg',
  'gospodarska-vozila': '/img/categories/commercial.jpg',
  'strojevi': '/img/categories/machinery.jpg',
};

// Editorial numbered ledger. Six categories rendered as full-width horizontal rows:
// numeric index, name, drawing red hairline, and a thin photographic strip that opens
// on hover. Not a tile grid. Photography is a column of context, not a poster.
export const CategoryGrid = () => {
  // Pick the first six taxonomy entries — taxonomy is the source of truth for routes.
  // If fewer than 6 exist, the layout still works.
  const ordered = navigationMenu.slice(0, 6);

  return (
    <section className="py-20 lg:py-28 px-6 sm:px-10 lg:px-14 max-w-[1480px] mx-auto">
      {/* Section masthead */}
      <div className="flex items-end justify-between mb-12 lg:mb-16">
        <div>
          <p className="text-[10px] font-light uppercase tracking-[0.35em] text-primary mb-3">
            Index
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light uppercase tracking-tight text-foreground leading-tight">
            Pregled po vrsti vozila
          </h2>
        </div>
        <span className="hidden sm:block text-[10px] font-light uppercase tracking-[0.3em] text-muted-foreground tabular-nums">
          {String(ordered.length).padStart(2, '0')} kategorija
        </span>
      </div>

      <ul className="border-t border-border">
        {ordered.map((category, i) => {
          const idx = String(i + 1).padStart(2, '0');
          const img = categoryImages[category.slug] || categoryImages['osobni-automobili'];
          return (
            <li key={category.slug} className="border-b border-border">
              <Link
                to={`/${category.slug}`}
                aria-label={`Pregled kategorije ${category.name}`}
                className="group relative grid grid-cols-12 items-center gap-4 px-2 py-7 lg:py-9 focus:outline-none focus-visible:bg-muted transition-colors"
              >
                {/* Numeric index */}
                <span className="col-span-2 sm:col-span-1 text-[11px] font-light uppercase tracking-[0.3em] text-muted-foreground tabular-nums">
                  {idx}
                </span>

                {/* Category name + drawing rule */}
                <span className="col-span-7 sm:col-span-5 flex items-center gap-4 lg:gap-6">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-light uppercase tracking-[0.06em] text-foreground transition-colors duration-500 group-hover:text-primary">
                    {category.name}
                  </span>
                  {/* Signature index rule — draws on hover */}
                  <span
                    aria-hidden="true"
                    className="hidden lg:block h-px bg-primary w-0 group-hover:w-24 transition-all duration-700 ease-out"
                  />
                </span>

                {/* Photograph reveal — thin slice, opens on hover */}
                <span className="hidden sm:block col-span-5 relative aspect-[16/4] overflow-hidden bg-muted">
                  <img
                    src={img}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    onError={onImgError}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-[900ms] ease-out"
                  />
                  {/* Vignette keeps any photo readable beside type */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/10 to-transparent group-hover:from-background/40 transition-colors duration-700"
                  />
                </span>

                {/* Trailing arrow */}
                <span className="col-span-3 sm:col-span-1 flex items-center justify-end">
                  <ArrowUpRight
                    className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
