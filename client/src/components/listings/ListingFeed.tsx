import { useParams } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import { navigationCategories } from '../../config/navigation';

export const ListingFeed = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const currentCategory = categorySlug ? navigationCategories.find(cat => cat.slug === categorySlug) : null;
  const CategoryIcon = currentCategory?.icon || Package;

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-16">
      <div className="flex flex-col items-center gap-8 max-w-md text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative p-8 rounded-full bg-card border border-border/40">
            <CategoryIcon className="h-16 w-16 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground">
            {currentCategory ? currentCategory.label : 'Svi oglasi'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {currentCategory 
              ? `Pretraživanje ${currentCategory.label.toLowerCase()} kategorije...`
              : 'Učitavanje svih dostupnih oglasa...'
            }
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-accent/50 border border-border/40">
          <Search className="h-4 w-4 text-muted-foreground animate-pulse" />
          <span className="text-sm text-muted-foreground font-medium">
            Povezivanje s bazom podataka
          </span>
        </div>
      </div>
    </div>
  );
};