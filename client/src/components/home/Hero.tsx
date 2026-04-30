import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTypingAnimation } from '../../hooks/useTypingAnimation';
import { SuperSearchModal } from '../search/SuperSearchModal';
import { onImgError } from '../../lib/imageFallback';

export const Hero = () => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [kmMax, setKmMax] = useState('');
  const navigate = useNavigate();

  const { displayText } = useTypingAnimation({
    texts: ['Audi A6 Avant', 'BMW M3 Competition', 'Golf 8 GTI', 'Zagreb - Split'],
    typingSpeed: 60,
    pauseDuration: 2500,
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    if (kmMax) params.set('kmMax', kmMax);
    navigate('/?' + params.toString());
  };

  return (
    <section className="relative w-full h-[85vh] min-h-[640px] flex items-center justify-center overflow-hidden z-0 bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/img/placeholder-car.jpg"
          alt="Luxury car background"
          className="w-full h-full object-cover"
          onError={onImgError}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 max-w-3xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight mb-3">
            Vozila.hr
          </h1>
          <p className="text-sm font-light text-white/50 tracking-widest uppercase">
            Premium marketplace za vozila
          </p>
        </div>

        {/* Floating Frosted Search Window */}
        <div className="relative backdrop-blur-md bg-white/5 border border-white/10">
          {/* Fallback for browsers without backdrop-filter */}
          <div className="absolute inset-0 bg-black/60 -z-10" />

          {/* Row 1: Search with Typing Animation */}
          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={displayText || 'Pretražite...'}
                className="w-full h-10 pl-7 pr-4 bg-transparent border-b border-white/20 text-white placeholder-white/30 text-sm font-light focus:outline-none focus:border-white/40 transition-colors"
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                {searchQuery && (
                  <span className="text-[10px] text-white/30 font-light tracking-widest uppercase">
                    Enter
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Minimalist Filters — Cijena od, Cijena do, Kilometri do */}
          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-light uppercase tracking-widest text-white/40 mb-2">
                  Cijena od (€)
                </label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs font-light focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-light uppercase tracking-widest text-white/40 mb-2">
                  Cijena do (€)
                </label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="999.999"
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs font-light focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-light uppercase tracking-widest text-white/40 mb-2">
                  Kilometri do
                </label>
                <input
                  type="number"
                  value={kmMax}
                  onChange={(e) => setKmMax(e.target.value)}
                  placeholder="999.999"
                  className="w-full h-10 px-3 bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs font-light focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Row 3: DETALJNA PRETRAGA */}
          <div className="p-4 sm:p-6">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 h-10 px-4 border border-white/20 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/40 transition-all duration-300 text-xs font-light uppercase tracking-widest"
            >
              <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
              DETALJNA PRETRAGA
            </button>
          </div>
        </div>

        {/* Quick Category Links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {['Automobili', 'Motocikli', 'Slobodno vrijeme', 'Gospodarska'].map((cat) => {
            const slugMap: Record<string, string> = {
              'Automobili': 'osobni-automobili',
              'Motocikli': 'motocikli',
              'Slobodno vrijeme': 'slobodno-vrijeme',
              'Gospodarska': 'gospodarska-vozila',
            };
            return (
              <Link
                key={cat}
                to={`/?category=${slugMap[cat]}`}
                className="text-[10px] font-light text-white/30 uppercase tracking-widest hover:text-white/70 transition-colors duration-300"
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Subtle Gradient Break - Bottom 15% Only */}
      <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-background via-transparent to-transparent z-10" />

      {/* Super Search Modal */}
      <SuperSearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
    </section>
  );
};
