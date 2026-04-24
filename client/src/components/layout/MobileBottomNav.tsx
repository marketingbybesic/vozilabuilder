import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Heart, Search, User } from 'lucide-react';
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
      <nav className={`lg:hidden fixed bottom-0 left-0 w-full z-[90] transition-transform duration-500 ${
        isHidden ? 'translate-y-full' : 'translate-y-0'
      }`}>
        {/* Metallic Sheen Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        
        {/* Navigation Content */}
        <div className="bg-primary/95 backdrop-blur-xl border-t border-white/20 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="flex items-center justify-evenly px-4 py-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex flex-col items-center gap-1 p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300 active:scale-95"
            >
              {isDark ? (
                <Sun className="h-6 w-6" strokeWidth={2.5} />
              ) : (
                <Moon className="h-6 w-6" strokeWidth={2.5} />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider">Tema</span>
            </button>

            {/* Favorites */}
            <Link
              to="/favorites"
              className="relative flex flex-col items-center gap-1 p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300 active:scale-95"
            >
              <Heart className="h-6 w-6" strokeWidth={2.5} />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-white text-primary text-[10px] font-bold flex items-center justify-center rounded-full shadow-md">
                  {favoritesCount}
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider">Favoriti</span>
            </Link>

            {/* Search - Opens SuperSearchModal */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex flex-col items-center gap-1 p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300 active:scale-95"
            >
              <Search className="h-6 w-6" strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Traži</span>
            </button>

            {/* Profile */}
            <button className="flex flex-col items-center gap-1 p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300 active:scale-95">
              <User className="h-6 w-6" strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Profil</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Super Search Modal */}
      <SuperSearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
    </>
  );
};
