import { useState } from 'react';
import { Menu, X, Plus } from 'lucide-react';
import { navigationCategories } from '../../config/navigation';

// ============================================================================
// Header Component - Sticky Navigation with Mobile Menu
// ============================================================================

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a 
            href="/" 
            className="text-2xl font-bold text-foreground hover:text-primary transition-colors duration-300"
          >
            Vozila.hr
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigationCategories.map((category) => {
              const Icon = category.icon;
              return (
                <a
                  key={category.id}
                  href={`/?category=${category.slug}`}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group"
                >
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>{category.label}</span>
                </a>
              );
            })}
          </nav>

          {/* CTA Button */}
          <button
            className="hidden md:flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Predaj oglas
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navigationCategories.map((category) => {
              const Icon = category.icon;
              return (
                <a
                  key={category.id}
                  href={`/?category=${category.slug}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-accent transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{category.label}</span>
                </a>
              );
            })}
            
            {/* Mobile CTA */}
            <button
              className="flex items-center justify-center gap-2 px-6 py-3 mt-4 bg-primary text-primary-foreground rounded-lg font-medium hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Predaj oglas
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
