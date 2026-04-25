import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Heart, User, Search } from 'lucide-react';
import { SuperSearchModal } from '../search/SuperSearchModal';

export const MobileBottomNav = () => {
  const [isDark, setIsDark] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const savedFavorites = JSON.parse(localStorage.getItem('vozila_favs') || '[]');
    setFavoritesCount(savedFavorites.length);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = documentHeight - scrollPosition;

      // Hide bottom nav when within 100px of footer
      if (distanceFromBottom < 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className={`lg:hidden fixed bottom-0 w-full bg-background border-t border-border z-[100] transition-transform duration-500 ${
        isHidden ? 'translate-y-full' : 'translate-y-0'
      }`}>
          <div className="flex items-center justify-evenly px-4 py-3">

            {/* Search */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex flex-col items-center gap-1 p-2 text-foreground hover:bg-muted rounded-none transition-all duration-300 active:scale-95"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[8px] font-light uppercase tracking-widest">PRETRAGA</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex flex-col items-center gap-1 p-2 text-foreground hover:bg-muted rounded-none transition-all duration-300 active:scale-95"
            >
              {isDark ? (
                <Sun className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Moon className="h-5 w-5" strokeWidth={1.5} />
              )}
              <span className="text-[8px] font-light uppercase tracking-widest">TEMA</span>
            </button>

            {/* Favorites */}
            <Link
              to="/favorites"
              className="relative flex flex-col items-center gap-1 p-2 text-foreground hover:bg-muted rounded-none transition-all duration-300 active:scale-95"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-white text-primary text-[10px] font-bold flex items-center justify-center rounded-full shadow-md">
                  {favoritesCount}
                </span>
              )}
              <span className="text-[8px] font-light uppercase tracking-widest">FAVORITI</span>
            </Link>

            {/* Profile */}
            <Link
              to="/profil"
              className="flex flex-col items-center gap-1 p-2 text-foreground hover:bg-muted rounded-none transition-all duration-300 active:scale-95"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[8px] font-light uppercase tracking-widest">PROFIL</span>
            </Link>
          </div>
      </nav>

      {/* Super Search Modal */}
      <SuperSearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
    </>
  );
};
