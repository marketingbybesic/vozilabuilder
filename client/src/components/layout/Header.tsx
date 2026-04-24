import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Plus } from 'lucide-react';
import { navigationCategories } from '../../config/navigation';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors duration-300">
            Vozila.hr
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navigationCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.id} to={`/${category.slug}`} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group">
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>{category.label}</span>
                </Link>
              );
            })}
          </nav>

          <button className="hidden md:flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-lg">
            <Plus className="h-4 w-4" />
            Predaj oglas
          </button>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-foreground">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};