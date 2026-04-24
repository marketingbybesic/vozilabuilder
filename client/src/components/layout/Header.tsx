import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Plus, Sun, Moon, Heart, User, ChevronDown, Search, ChevronRight } from 'lucide-react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { navigationMenu } from '../../config/taxonomy';
import { SuperSearchModal } from '../search/SuperSearchModal';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get('category');

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const savedFavorites = JSON.parse(localStorage.getItem('vozila_favs') || '[]');
    setFavoritesCount(savedFavorites.length);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* TIER 1: TOP BAR */}
      <div className="h-16 bg-background/95 backdrop-blur-md border-b border-border/40 flex justify-between items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity duration-300 group">
          <img 
            src="/vozilahrlogo-light.svg" 
            alt="Vozila hr logo" 
            className="h-6 w-auto object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(0,130,210,0.4)] block dark:hidden"
          />
          <img 
            src="/vozilahrlogo-dark.svg" 
            alt="Vozila hr logo dark" 
            className="h-6 w-auto object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(255,40,0,0.4)] hidden dark:block"
          />
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop Utility Icons - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Search Icon */}
            <button 
              onClick={() => setSearchModalOpen(true)}
              className="p-2 rounded-full hover:bg-accent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300"
            >
              <Search className="h-5 w-5" strokeWidth={2.5} />
            </button>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300">
              {isDark ? <Sun className="h-5 w-5" strokeWidth={2.5} /> : <Moon className="h-5 w-5" strokeWidth={2.5} />}
            </button>

            {/* Favorites */}
            <Link to="/favorites" className="relative p-2 rounded-full hover:bg-accent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300">
              <Heart className="h-5 w-5" strokeWidth={2.5} />
              {favoritesCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full shadow-md animate-pulse">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <button className="p-2 rounded-full hover:bg-accent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300">
              <User className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Predaj oglas Button */}
          <Link to="/predaj-oglas" className="hidden md:flex items-center gap-2 ml-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all duration-300 shadow-lg whitespace-nowrap">
            <Plus className="h-4 w-4" />
            Predaj oglas
          </Link>

          {/* Mobile: Predaj oglas Button (Compact) */}
          <Link to="/predaj-oglas" className="flex md:hidden items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all duration-300 shadow-lg whitespace-nowrap">
            <Plus className="h-3.5 w-3.5" />
            Oglas
          </Link>

          {/* Mobile Hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1 text-foreground hover:text-primary transition-colors ml-1">
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* TIER 2: CATEGORY BAR - Desktop Only */}
      <div className="h-10 bg-primary hidden lg:flex justify-center items-center shadow-md relative z-40">
        <NavigationMenu.Root className="relative">
          <NavigationMenu.List className="flex items-center gap-1">
            {navigationMenu.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.slug;
              
              return (
                <NavigationMenu.Item key={category.slug}>
                  <NavigationMenu.Trigger className={`group flex items-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white hover:bg-white/10 transition-all duration-300 ${
                    isActive ? 'bg-white/20' : ''
                  }`}>
                    {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
                    <span>{category.name}</span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </NavigationMenu.Trigger>
                  
                  {/* Dropdown Content */}
                  <NavigationMenu.Content className="absolute left-0 top-0 w-[500px] p-4">
                    <ul className="grid grid-cols-2 gap-2">
                      {/* View All Link */}
                      <li className="col-span-2 mb-2">
                        <NavigationMenu.Link asChild>
                          <Link
                            to={`/?category=${category.slug}`}
                            className="block px-4 py-3 text-sm font-bold text-foreground bg-accent/50 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200"
                          >
                            Prikaži sve: {category.name}
                          </Link>
                        </NavigationMenu.Link>
                      </li>

                      {/* Subcategories */}
                      {category.sub.map((subcat) => {
                        const SubIcon = subcat.icon;
                        return (
                          <li key={subcat.slug}>
                            <NavigationMenu.Link asChild>
                              <Link
                                to={`/?category=${category.slug}&subcategory=${subcat.slug}`}
                                className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-accent/50 rounded-lg transition-all duration-200 group"
                              >
                                <div className="flex items-center gap-2">
                                  {SubIcon && <SubIcon className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />}
                                  <span>{subcat.name}</span>
                                </div>
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                              </Link>
                            </NavigationMenu.Link>
                          </li>
                        );
                      })}
                    </ul>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              );
            })}
          </NavigationMenu.List>
          
          {/* CRITICAL VIEWPORT ALIGNMENT */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 flex justify-center mt-0 perspective-[2000px] w-full max-w-7xl">
            <NavigationMenu.Viewport className="relative w-[500px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-b-2xl shadow-2xl overflow-hidden transition-[height] duration-300 data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut" />
          </div>
        </NavigationMenu.Root>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto z-40">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navigationMenu.map((category) => {
              const Icon = category.icon;
              const isOpen = openMobileCategory === category.slug;
              const isActive = activeCategory === category.slug;
              
              return (
                <div key={category.slug} className="rounded-lg overflow-hidden">
                  {/* Category Button */}
                  <button
                    onClick={() => setOpenMobileCategory(isOpen ? null : category.slug)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                      <span className="font-bold uppercase tracking-widest text-sm">{category.name}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Subcategories */}
                  {isOpen && (
                    <div className="mt-1 ml-4 pl-6 pr-4 py-2 space-y-1 border-l-2 border-border/40 animate-slideDown">
                      <Link
                        to={`/?category=${category.slug}`}
                        className="block px-3 py-2 text-sm font-semibold text-foreground hover:text-primary hover:bg-accent/50 rounded-lg transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sve {category.name}
                      </Link>
                      
                      {category.sub.map((subcat) => {
                        const SubIcon = subcat.icon;
                        return (
                          <Link
                            key={subcat.slug}
                            to={`/?category=${category.slug}&subcategory=${subcat.slug}`}
                            className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {SubIcon && <SubIcon className="h-4 w-4 mr-3 opacity-70" />}
                            {subcat.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
            <Link to="/predaj-oglas" className="flex items-center justify-center gap-2 px-6 py-4 mt-4 bg-primary text-primary-foreground rounded-lg font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all duration-300 shadow-lg">
              <Plus className="h-5 w-5" />
              Predaj oglas
            </Link>
          </nav>
        </div>
      )}

      {/* Super Search Modal */}
      <SuperSearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
    </header>
  );
};
