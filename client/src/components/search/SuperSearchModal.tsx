import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, Sparkles, Settings2, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { globalFilters, categoryFilters, FilterDefinition } from '../../config/filters';
import { navigationMenu } from '../../config/taxonomy';

interface SuperSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SuperSearchModal = ({ open, onOpenChange }: SuperSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLucky, setIsLoadingLucky] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('osobni-automobili');
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const popularSearches = [
    'Audi A6',
    'MTB Bicikli',
    'Quad Ture',
    'BMW M3',
    'E-Bicikli',
    'Kamperi'
  ];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    
    // Add search query if present
    if (searchQuery.trim()) {
      params.set('search', searchQuery);
    }
    
    // Add category
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    
    // Add all advanced filters
    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    navigate('/?' + params.toString());
    onOpenChange(false);
    setSearchQuery('');
    setAdvancedFilters({});
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdvancedFilters(prev => ({ ...prev, [name]: value }));
  };

  // Dynamic filter input renderer for modal
  const renderModalFilterInput = (filter: FilterDefinition) => {
    if (filter.type === 'range') {
      return (
        <div className="flex gap-2">
          <input 
            type="number" 
            name={`${filter.id}Min`} 
            placeholder="Od" 
            value={advancedFilters[`${filter.id}Min`] || ''} 
            onChange={handleFilterChange} 
            className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
          />
          <input 
            type="number" 
            name={`${filter.id}Max`} 
            placeholder="Do" 
            value={advancedFilters[`${filter.id}Max`] || ''} 
            onChange={handleFilterChange} 
            className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" 
          />
        </div>
      );
    }
    if (filter.type === 'select') {
      return (
        <select 
          name={filter.id} 
          value={advancedFilters[filter.id] || ''} 
          onChange={handleFilterChange} 
          className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary appearance-none outline-none transition-all"
        >
          <option value="">Sve</option>
          {filter.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    if (filter.type === 'radio') {
      return (
        <div className="flex gap-3">
          {filter.options?.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input 
                type="radio" 
                name={filter.id} 
                value={opt.value} 
                checked={advancedFilters[filter.id] === String(opt.value)} 
                onChange={handleFilterChange} 
                className="accent-primary" 
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleFeelingLucky = async () => {
    setIsLoadingLucky(true);
    try {
      // Get total count of active listings
      const { count, error: countError } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (countError) throw countError;
      if (!count || count === 0) {
        alert('Nema dostupnih oglasa');
        return;
      }

      // Generate random offset
      const randomOffset = Math.floor(Math.random() * count);

      // Fetch random listing
      const { data, error } = await supabase
        .from('listings')
        .select('id')
        .eq('status', 'active')
        .range(randomOffset, randomOffset)
        .single();

      if (error) throw error;
      if (data) {
        navigate(`/?listingId=${data.id}`);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error fetching random listing:', error);
      alert('Greška pri dohvaćanju slučajnog oglasa');
    } finally {
      setIsLoadingLucky(false);
    }
  };

  const handleChipClick = (query: string) => {
    setSearchQuery(query);
    navigate(`/?search=${encodeURIComponent(query)}`);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        {/* Content */}
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] max-w-3xl w-full bg-card border border-border/50 rounded-2xl shadow-2xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          
          {/* Close Button */}
          <Dialog.Close className="absolute right-4 top-4 p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200">
            <X className="h-5 w-5" />
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title className="text-2xl font-black text-foreground mb-6 flex items-center gap-3">
            <Search className="h-7 w-7 text-primary" />
            Super Pretraga
          </Dialog.Title>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Massive Google-style Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži... npr. BMW M3, Zagreb, Quad Ture"
                className="w-full text-2xl font-black px-6 py-4 bg-accent/30 border-2 border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground placeholder:font-normal"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Button */}
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Search className="h-5 w-5" />
                Pretraži
              </button>

              {/* Dopamine Button - Feeling Lucky */}
              <button
                type="button"
                onClick={handleFeelingLucky}
                disabled={isLoadingLucky}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingLucky ? (
                  <>
                    <Sparkles className="h-5 w-5 animate-spin" />
                    Tražim...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🎲</span>
                    Iznenadi me!
                  </>
                )}
              </button>
            </div>

            {/* Advanced Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mt-4 transition-colors duration-200"
            >
              <Settings2 className="w-4 h-4" />
              Napredno pretraživanje
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </form>

          {/* Advanced Filter Section */}
          <div className={`overflow-hidden transition-all duration-500 ${showAdvanced ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-6 p-6 bg-accent/20 border border-border/40 rounded-xl space-y-6">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Kategorija
                </label>
                <div className="flex flex-wrap gap-2">
                  {navigationMenu.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.slug}
                        type="button"
                        onClick={() => setSelectedCategory(category.slug)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                          selectedCategory === category.slug
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'bg-accent/50 text-foreground hover:bg-accent'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Global Filters */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Osnovno
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {globalFilters.map((filter) => (
                    <div key={filter.id} className="space-y-2">
                      <label className="block text-xs font-medium text-foreground">
                        {filter.label} {filter.unit && `(${filter.unit})`}
                      </label>
                      {renderModalFilterInput(filter)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category-Specific Filters */}
              {categoryFilters[selectedCategory] && categoryFilters[selectedCategory].length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Karakteristike
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryFilters[selectedCategory].map((filter) => (
                      <div key={filter.id} className="space-y-2">
                        <label className="block text-xs font-medium text-foreground">
                          {filter.label} {filter.unit && `(${filter.unit})`}
                        </label>
                        {renderModalFilterInput(filter)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Massive Search Button */}
              <button
                type="button"
                onClick={() => handleSearch()}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-base hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <Search className="h-6 w-6" />
                Pretraži
              </button>
            </div>
          </div>

          {/* Quick Search Chips */}
          <div className="mt-8 pt-6 border-t border-border/40">
            <p className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
              Popularno:
            </p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((query) => (
                <button
                  key={query}
                  onClick={() => handleChipClick(query)}
                  className="px-4 py-2 bg-accent/50 hover:bg-primary/10 hover:text-primary border border-border/40 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* Pro Tip */}
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <span className="font-bold text-primary">💡 Savjet:</span> Pokušajte s konkretnim pojmovima poput marke, modela, lokacije ili kategorije za najbolje rezultate.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
