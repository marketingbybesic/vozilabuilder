import { Link } from 'react-router-dom';
import { navigationMenu } from '../../config/taxonomy';
import { onImgError } from '../../lib/imageFallback';

const categoryImages: Record<string, string> = {
  'osobni-automobili': '/img/categories/cars.jpg',
  'motocikli': '/img/categories/motorcycles.jpg',
  'slobodno-vrijeme': '/img/categories/leisure.jpg',
  'gospodarska-vozila': '/img/categories/commercial.jpg',
  'dijelovi-oprema': '/img/categories/parts.jpg',
  'strojevi': '/img/categories/machinery.jpg',
};

export const CategoryGrid = () => {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-[10px] font-light uppercase tracking-widest text-muted-foreground mb-2">
          Kategorije
        </h2>
        <p className="text-xl font-light uppercase tracking-widest text-foreground">
          Pregledaj po vrsti vozila
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {navigationMenu.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.slug}
              to={`/?category=${category.slug}`}
              className="group relative aspect-[4/3] overflow-hidden border border-white/10"
            >
              {/* Background Image */}
              <img
                src={categoryImages[category.slug] || categoryImages['osobni-automobili']}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                loading="lazy"
                onError={onImgError}
              />

              {/* Dark base overlay */}
              <div className="absolute inset-0 bg-black/40 transition-opacity duration-500 group-hover:bg-black/20" />

              {/* Translucent accent overlay */}
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-60" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                {Icon && (
                  <Icon
                    className="w-5 h-5 text-white/70 mb-2 transition-transform duration-500 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                )}
                <span className="text-[10px] font-light uppercase tracking-[0.2em] text-white text-center leading-tight">
                  {category.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
