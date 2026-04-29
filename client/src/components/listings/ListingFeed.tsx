import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs';
import { supabase } from '../../lib/supabase';
import { getAnalytics } from '../../lib/analytics';
import {
  Calendar, Gauge, Zap, SlidersHorizontal, ChevronDown, ChevronUp,
  Box, Clock, ArrowDown10, ArrowUp01, Eye, ChevronLeft, ChevronRight,
  ShieldCheck, Sparkles, Star, Loader2
} from 'lucide-react';
import { navigationMenu } from '../../config/taxonomy';
import { globalFilters, categoryFilters, FilterDefinition } from '../../config/filters';
import { Listing } from '../../types';
import { Helmet } from 'react-helmet-async';

const ITEMS_PER_PAGE = 9;

// --- MAKES LIST ---
const MAKES = [
  'BMW', 'Audi', 'Mercedes', 'Volkswagen', 'Toyota', 'Honda', 'Ford', 'Opel',
  'Škoda', 'Hyundai', 'Kia', 'Renault', 'Peugeot', 'Citroën', 'Fiat', 'Seat',
  'Volvo', 'Porsche', 'Mazda', 'Nissan', 'Mitsubishi', 'Subaru', 'Jeep', 'Land Rover',
  'Dacia', 'Alfa Romeo', 'Lancia', 'Suzuki', 'Lexus', 'Infiniti', 'Jaguar', 'Mini',
  'Chrysler', 'Dodge', 'Tesla', 'Rivian'
];

// --- WEIGHTED SCORE CALCULATION ---
const computeWeightedScore = (car: Listing): number => {
  let score = 1.0;
  const images = car.listing_images || [];
  score += Math.min(images.length * 0.3, 1.5);
  if (car.is_featured) score += 0.5;
  const isVerified = car.owner?.is_verified || car.owner?.dealer_verified || car.owner?.tier === 'premium';
  if (isVerified) score += 0.3;
  if (car.description && car.description.length > 100) score += 0.2;
  return score;
};

// --- CUSTOM UI COMPONENTS ---

const Accordion = ({ title, children, defaultOpen = true }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/40 last:border-0 py-4 first:pt-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">
          {title}
        </span>
        {isOpen ?
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" /> :
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
        }
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-premium ${isOpen ? 'max-h-[600px] opacity-100 mt-5' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

const SortDropdown = ({ value, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { id: 'weighted_score', label: 'Prema preporuci', icon: Star },
    { id: 'newest', label: 'Najnovije dodano', icon: Clock },
    { id: 'price_asc', label: 'Cijena: Najniža', icon: ArrowDown10 },
    { id: 'price_desc', label: 'Cijena: Najviša', icon: ArrowUp01 },
  ];

  const selected = options.find(o => o.id === value) || options[0];
  const SelectedIcon = selected.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[240px]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-card/60 backdrop-blur-sm border border-border/60 pl-4 pr-3 py-3.5 rounded-none hover:border-primary/50 transition-colors shadow-sm group"
      >
        <div className="flex items-center gap-2">
          <SelectedIcon className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
            {selected.label}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-full bg-card/95 backdrop-blur-xl border border-border/60 rounded-none shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => { onChange(option.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  value === option.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${value === option.id ? 'text-primary' : 'text-slate-400'}`} />
                <span className="text-[11px] font-bold uppercase tracking-widest">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const StateDisplay = ({ icon: Icon, title, subtitle, isSpinning = false }: any) => (
  <div className="flex flex-col items-center justify-center py-24 text-center w-full">
    <div className="relative flex items-center justify-center w-40 h-40 mb-8 group">
      <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 blur-[40px] rounded-full scale-110 group-hover:scale-125 transition-transform duration-700"></div>
      <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl">
        <Icon className={`w-10 h-10 text-slate-800 dark:text-slate-100 ${isSpinning ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
      </div>
    </div>
    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
      {title}
    </h3>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
      {subtitle}
    </p>
  </div>
);

// --- PREMIUM LISTING CARD COMPONENT ---

export const ListingCard = ({ car }: { car: Listing }) => {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const specs = typeof car.attributes === 'string' ? JSON.parse(car.attributes) : car.attributes;
  const images = car.listing_images?.length > 0 ? car.listing_images : [];

  const sortedImages = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
  const displayImg = sortedImages[currentImgIdx]?.url;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev + 1) % sortedImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };

  const isVerified = car.owner?.is_verified || car.owner?.dealer_verified || car.owner?.tier === 'premium';

  return (
    <div
      className={`group flex flex-col border overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-700 ease-premium cursor-pointer h-full shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ${
        car.is_featured
          ? 'bg-primary/5 border-primary/30 rounded-2xl'
          : 'bg-card border-border/40 rounded-2xl'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCurrentImgIdx(0); }}
    >
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
        {displayImg ? (
          <>
            <img
              src={displayImg}
              alt={`${car.title} background`}
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 transition-transform duration-1000 ease-premium"
            />
            <img
              src={displayImg}
              alt={car.title}
              className={`absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-1000 ease-premium ${isHovered && sortedImages.length <= 1 ? 'scale-110' : ''}`}
            />
          </>
        ) : (
          <img src="/vozilahrlogo.svg" alt="Nema slike" className="h-10 w-auto opacity-10 dark:opacity-20 transform group-hover:scale-110 transition-transform duration-1000 ease-premium" />
        )}

        {isHovered && sortedImages.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {sortedImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {sortedImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentImgIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
          {car.is_featured && (
            <div className="px-3 py-1.5 bg-primary text-black backdrop-blur-md rounded-none text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" strokeWidth={2} />
              Istaknuto
            </div>
          )}
          {isVerified && (
            <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-none text-[9px] font-light uppercase tracking-widest text-white shadow-lg flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-primary" strokeWidth={2} />
              Verificirani prodavač
            </div>
          )}
        </div>

        <div className={`absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg flex items-center gap-1.5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Eye className="w-3 h-3" />
          {(car.views_count ?? 0) + 124} pregleda
        </div>
      </div>

      <div className="p-5 xl:p-6 flex flex-col flex-grow">
        <div className="mb-5 flex-grow">
          <h3 className="text-base xl:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
            {car.title}
          </h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] xl:text-xs font-semibold text-slate-500 dark:text-slate-400">
            {(specs.godina || car.year) && <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {specs.godina || car.year}</span>}
            {(specs.kilometraza || car.mileage) && <span className="flex items-center gap-2"><Gauge className="w-3.5 h-3.5 text-slate-400" /> {(specs.kilometraza || car.mileage).toLocaleString()} km</span>}
            {specs.snaga_ks && <span className="flex items-center gap-2 col-span-2"><Zap className="w-3.5 h-3.5 text-slate-400" /> {specs.snaga_ks} KS</span>}
          </div>
        </div>

        <div className="mt-auto pt-5 border-t border-border/40 flex items-end justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Cijena</p>
            {Number(car.price) === 0 ? (
              <p className="text-2xl font-black italic text-primary tracking-tight drop-shadow-sm">
                Na upit
              </p>
            ) : (
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {Number(car.price).toLocaleString('hr-HR')} <span className="text-base font-bold text-slate-400 ml-0.5">{car.currency || '€'}</span>
              </p>
            )}
          </div>

          <div className="px-3 py-1.5 border border-border/60 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-500">
            Prodaja
          </div>
        </div>
      </div>
    </div>
  );
};

// --- INLINE AD COMPONENT ---

const NativeAdSlotEnhanced = () => (
  <div className="relative bg-primary/5 border border-primary/20 rounded-none overflow-hidden flex flex-col justify-center p-6 md:col-span-2 lg:col-span-2 2xl:col-span-1 h-full min-h-[280px]">
    <div className="absolute top-3 left-3">
      <span className="text-[9px] font-light uppercase tracking-widest text-primary/60">
        Preporučeno
      </span>
    </div>
    <div className="space-y-3">
      <h4 className="text-lg font-light text-foreground tracking-widest leading-tight">
        Želite više prodaje?
      </h4>
      <p className="text-sm font-light text-muted-foreground leading-relaxed">
        Postanite Premium partner i dođite do tisuća potencijalnih kupaca.
      </p>
      <Link
        to="/za-partnere"
        className="inline-block px-6 py-3 bg-primary text-black text-[10px] font-light uppercase tracking-widest hover:bg-primary/90 transition-colors"
      >
        Saznajte više
      </Link>
    </div>
  </div>
);

// --- MAKE/MODEL CASCADE COMPONENT ---

interface ModelOption {
  value: string;
  count: number;
}

const MakeModelFilter = ({
  selectedMake,
  selectedModel,
  onMakeChange,
  onModelChange,
}: {
  selectedMake: string;
  selectedModel: string;
  onMakeChange: (make: string) => void;
  onModelChange: (model: string) => void;
}) => {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!selectedMake) {
      setModels([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingModels(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('attributes')
          .eq('status', 'active')
          .eq('attributes->>make', selectedMake);

        if (error) throw error;

        const modelCounts: Record<string, number> = {};
        (data || []).forEach((row: any) => {
          const attrs = typeof row.attributes === 'string' ? JSON.parse(row.attributes) : row.attributes;
          const model = attrs?.model;
          if (model) {
            modelCounts[model] = (modelCounts[model] || 0) + 1;
          }
        });

        const sorted = Object.entries(modelCounts)
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count);

        setModels(sorted);
      } catch {
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedMake]);

  return (
    <div className="space-y-4">
      {/* Make Dropdown */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Marka</label>
        <select
          value={selectedMake}
          onChange={(e) => {
            onMakeChange(e.target.value);
            onModelChange('');
          }}
          className="w-full bg-background/50 border border-border/60 rounded-none px-3 py-2 text-xs focus:ring-1 focus:ring-primary appearance-none outline-none transition-all"
        >
          <option value="">Sve marke</option>
          {MAKES.map(make => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>
      </div>

      {/* Model — chip-based, shown only when make is selected */}
      {selectedMake && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            Model
            {loadingModels && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </label>
          {!loadingModels && models.length === 0 && (
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Nema modela</p>
          )}
          {models.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => onModelChange('')}
                className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all duration-200 ${
                  !selectedModel
                    ? 'bg-primary text-white border-2 border-primary'
                    : 'bg-secondary/50 border-2 border-border/40 text-muted-foreground hover:border-primary/50'
                }`}
              >
                Sve
              </button>
              {models.map(({ value, count }) => (
                <button
                  key={value}
                  onClick={() => onModelChange(value)}
                  className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all duration-200 ${
                    selectedModel === value
                      ? 'bg-primary text-white border-2 border-primary'
                      : 'bg-secondary/50 border-2 border-border/40 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {value} ({count})
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN FEED COMPONENT ---

export const ListingFeed = () => {
  const { categorySlug: paramCategorySlug } = useParams<{ categorySlug: string }>();

  // nuqs URL state — all filter params live in the URL
  const [queryState, setQueryState] = useQueryStates({
    make: parseAsString.withDefault(''),
    model: parseAsString.withDefault(''),
    price_min: parseAsInteger.withDefault(0),
    price_max: parseAsInteger.withDefault(0),
    year_min: parseAsInteger.withDefault(0),
    year_max: parseAsInteger.withDefault(0),
    mileage_max: parseAsInteger.withDefault(0),
    power_min: parseAsInteger.withDefault(0),
    fuel: parseAsString.withDefault(''),
    transmission: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('weighted_score'),
    lat: parseAsString.withDefault(''),
    lng: parseAsString.withDefault(''),
    radius: parseAsInteger.withDefault(50),
  });

  const categorySlug = paramCategorySlug || null;

  const [cars, setCars] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const sortBy = queryState.sort;

  const currentCategory = navigationMenu.find(c => c.slug === categorySlug);
  const displayTitle = currentCategory ? currentCategory.name : 'SVI OGLASI';
  const CategoryIcon = currentCategory?.icon || Box;

  // Build SEO title from active filters
  const seoTitle = (() => {
    const parts: string[] = [];
    if (queryState.make) parts.push(queryState.make);
    if (queryState.model) parts.push(queryState.model);
    if (currentCategory) parts.push(currentCategory.name.toLowerCase());
    if (queryState.price_max > 0) parts.push(`do ${queryState.price_max.toLocaleString()}€`);
    if (parts.length === 0) return 'Sva vozila | Vozila.hr';
    return `${parts.join(' ')} na prodaju u Hrvatskoj | Vozila.hr`;
  })();

  const fetchListings = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);

      let query: any;
      if (queryState.lat && queryState.lng && queryState.radius) {
        query = supabase.rpc('search_listings_by_radius', {
          search_lat: parseFloat(queryState.lat),
          search_lng: parseFloat(queryState.lng),
          radius_km: queryState.radius,
        });
      } else {
        query = supabase
          .from('listings')
          .select('*, categories!inner(slug), listing_images(id, url, is_primary, sort_order), users!inner(id, dealer_verified, tier)', { count: 'exact' });
      }

      query = query.eq('status', 'active');
      if (categorySlug) query = query.eq('categories.slug', categorySlug);

      // Price filters
      if (queryState.price_min > 0) query = query.gte('price', queryState.price_min);
      if (queryState.price_max > 0) query = query.lte('price', queryState.price_max);

      // JSONB attribute filters
      if (queryState.make) query = query.eq('attributes->>make', queryState.make);
      if (queryState.model) query = query.eq('attributes->>model', queryState.model);
      if (queryState.fuel) query = query.eq('attributes->>fuel', queryState.fuel);
      if (queryState.transmission) query = query.eq('attributes->>transmission', queryState.transmission);
      if (queryState.year_min > 0) query = query.gte('attributes->>year', queryState.year_min);
      if (queryState.year_max > 0) query = query.lte('attributes->>year', queryState.year_max);
      if (queryState.mileage_max > 0) query = query.lte('attributes->>mileage', queryState.mileage_max);
      if (queryState.power_min > 0) query = query.gte('attributes->>power_hp', queryState.power_min);

      // Sorting (weighted_score is handled client-side after fetch)
      if (sortBy === 'price_asc') query = query.order('price', { ascending: true });
      else if (sortBy === 'price_desc') query = query.order('price', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      // Pagination
      const currentPage = isLoadMore ? page + 1 : 0;
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      let normalized = (data as any[] || []).map((item: any) => ({
        ...item,
        owner: item.users || item.owner,
      })) as Listing[];

      // Client-side weighted sort
      if (sortBy === 'weighted_score') {
        normalized = normalized.sort((a, b) => computeWeightedScore(b) - computeWeightedScore(a));
      }

      if (isLoadMore) {
        setCars(prev => [...prev, ...normalized]);
        setPage(currentPage);
      } else {
        setCars(normalized);
        setPage(0);
      }

      if (count !== null) setTotalCount(count);
      setHasMore(count !== null && to < count - 1);
    } catch (err) {
      console.error('Supabase Error:', err);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, queryState, sortBy, page]);

  useEffect(() => {
    fetchListings();
  }, [categorySlug, queryState.make, queryState.model, queryState.price_min, queryState.price_max,
    queryState.year_min, queryState.year_max, queryState.mileage_max, queryState.power_min,
    queryState.fuel, queryState.transmission, queryState.sort, queryState.lat, queryState.lng, queryState.radius]);

  const setFilter = (key: string, value: string | number) => {
    setQueryState({ [key]: value || null } as any);
  };

  const clearAllFilters = () => {
    setQueryState({
      make: null, model: null, price_min: null, price_max: null,
      year_min: null, year_max: null, mileage_max: null, power_min: null,
      fuel: null, transmission: null, lat: null, lng: null, radius: null,
    });
  };

  // Legacy filter state adapter for existing renderFilterInput
  const legacyFilters: Record<string, string> = {
    priceMin: queryState.price_min > 0 ? String(queryState.price_min) : '',
    priceMax: queryState.price_max > 0 ? String(queryState.price_max) : '',
    yearMin: queryState.year_min > 0 ? String(queryState.year_min) : '',
    yearMax: queryState.year_max > 0 ? String(queryState.year_max) : '',
    mileageMax: queryState.mileage_max > 0 ? String(queryState.mileage_max) : '',
    powerMin: queryState.power_min > 0 ? String(queryState.power_min) : '',
    lat: queryState.lat,
    lng: queryState.lng,
    radiusKm: String(queryState.radius),
    fuel: queryState.fuel,
    transmission: queryState.transmission,
  };

  const handleLegacyFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const keyMap: Record<string, string> = {
      priceMin: 'price_min', priceMax: 'price_max',
      yearMin: 'year_min', yearMax: 'year_max',
      mileageMax: 'mileage_max', powerMin: 'power_min',
      radiusKm: 'radius', lat: 'lat', lng: 'lng',
      fuel: 'fuel', transmission: 'transmission',
    };
    const nuqsKey = keyMap[name] || name;
    if (['price_min', 'price_max', 'year_min', 'year_max', 'mileage_max', 'power_min', 'radius'].includes(nuqsKey)) {
      setQueryState({ [nuqsKey]: value ? parseInt(value) : null } as any);
    } else {
      setQueryState({ [nuqsKey]: value || null } as any);
    }
  };

  const renderFilterInput = (filter: FilterDefinition) => {
    if (filter.type === 'range') {
      const histogramHeights = [40, 60, 80, 100, 90, 70, 85, 95, 75, 50];
      return (
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-0.5 h-8 px-1">
            {histogramHeights.map((height, idx) => (
              <div
                key={idx}
                className="flex-1 bg-primary/20 transition-all duration-300 hover:bg-primary/40"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              name={`${filter.id}Min`}
              placeholder="Od"
              value={legacyFilters[`${filter.id}Min`] || ''}
              onChange={handleLegacyFilterChange}
              className="w-full bg-background/50 border border-border/60 rounded-none px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            <input
              type="number"
              name={`${filter.id}Max`}
              placeholder="Do"
              value={legacyFilters[`${filter.id}Max`] || ''}
              onChange={handleLegacyFilterChange}
              className="w-full bg-background/50 border border-border/60 rounded-none px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
      );
    }
    if (filter.type === 'select') {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter(filter.id, '')}
            className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all duration-200 ${
              !legacyFilters[filter.id]
                ? 'bg-primary text-white border-2 border-primary'
                : 'bg-secondary/50 border-2 border-border/40 text-muted-foreground hover:border-primary/50'
            }`}
          >
            Sve
          </button>
          {filter.options?.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(filter.id, String(opt.value))}
              className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all duration-200 ${
                legacyFilters[filter.id] === String(opt.value)
                  ? 'bg-primary text-white border-2 border-primary'
                  : 'bg-secondary/50 border-2 border-border/40 text-muted-foreground hover:border-primary/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }
    if (filter.type === 'radio') {
      return (
        <div className="flex flex-wrap gap-2">
          {filter.options?.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(filter.id, String(opt.value))}
              className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all duration-200 ${
                legacyFilters[filter.id] === String(opt.value)
                  ? 'bg-primary text-white border-2 border-primary'
                  : 'bg-secondary/50 border-2 border-border/40 text-muted-foreground hover:border-primary/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }
    return null;
  };

  const currentCatFilters = categorySlug ? categoryFilters[categorySlug] : categoryFilters['osobni-automobili'];

  const hasActiveFilters = queryState.make || queryState.model || queryState.price_min > 0 ||
    queryState.price_max > 0 || queryState.year_min > 0 || queryState.year_max > 0 ||
    queryState.mileage_max > 0 || queryState.fuel || queryState.transmission;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={`Pronađite ${queryState.make || 'vozilo'} ${queryState.model || ''} na Vozila.hr — najvećem hrvatskom auto tržištu. ${totalCount} oglasa.`} />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-[1700px] flex flex-col xl:flex-row gap-8 lg:gap-12">

        <aside className="w-full xl:w-[320px] flex-shrink-0">
          <div className="sticky top-24 relative">
            <div className="absolute inset-0 bg-primary/5 blur-[50px] rounded-none -z-10 pointer-events-none"></div>

            <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-none p-6 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-5">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                  Napredna Pretraga
                </h3>
              </div>

              <div className="space-y-2">
                {/* Marka / Model Cascade */}
                <Accordion title="Marka i Model" defaultOpen={true}>
                  <MakeModelFilter
                    selectedMake={queryState.make}
                    selectedModel={queryState.model}
                    onMakeChange={(make) => setQueryState({ make: make || null, model: null } as any)}
                    onModelChange={(model) => setQueryState({ model: model || null } as any)}
                  />
                </Accordion>

                {/* Lokacija */}
                <Accordion title="Lokacija" defaultOpen={false}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Grad</label>
                      <select
                        onChange={(e) => {
                          const [lat, lng] = e.target.value.split(',');
                          setQueryState({ lat: lat || null, lng: lng || null } as any);
                        }}
                        className="w-full bg-background/50 border border-border/60 rounded-none px-3 py-2 text-xs focus:ring-1 focus:ring-primary appearance-none outline-none transition-all"
                      >
                        <option value="">Odaberi grad...</option>
                        <option value="45.815,15.981">Zagreb</option>
                        <option value="43.508,16.440">Split</option>
                        <option value="45.327,14.442">Rijeka</option>
                        <option value="42.650,18.094">Dubrovnik</option>
                        <option value="45.555,18.694">Osijek</option>
                        <option value="44.119,15.231">Zadar</option>
                        <option value="46.304,16.337">Varaždin</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Radijus: {queryState.radius || 50} km
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={queryState.radius || 50}
                        onChange={(e) => setQueryState({ radius: parseInt(e.target.value) } as any)}
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>
                </Accordion>

                {/* Osnovno */}
                <Accordion title="Osnovno" defaultOpen={true}>
                  <div className="space-y-4">
                    {globalFilters.map((filter) => (
                      <div key={filter.id} className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {filter.label} {filter.unit && `(${filter.unit})`}
                        </label>
                        {renderFilterInput(filter)}
                      </div>
                    ))}
                  </div>
                </Accordion>

                {/* Karakteristike */}
                {currentCatFilters && currentCatFilters.length > 0 && (
                  <Accordion title="Karakteristike" defaultOpen={true}>
                    <div className="space-y-4">
                      {currentCatFilters.map((filter) => (
                        <div key={filter.id} className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {filter.label} {filter.unit && `(${filter.unit})`}
                          </label>
                          {renderFilterInput(filter)}
                        </div>
                      ))}
                    </div>
                  </Accordion>
                )}

                <button
                  onClick={() => {
                    fetchListings(false);
                    try {
                      const analytics = getAnalytics();
                      analytics.trackSearchPerformed(queryState.make || 'filter_applied', queryState as any);
                    } catch {
                      // Analytics not initialized yet
                    }
                  }}
                  className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] py-4 rounded-none hover:scale-[1.02] transition-transform duration-300 shadow-xl mt-6"
                >
                  Primijeni Filtere
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                {queryState.make ? `${queryState.make}${queryState.model ? ` ${queryState.model}` : ''}` : displayTitle}
              </h2>
              {totalCount > 0 && !loading && (
                <p className="text-sm text-slate-500 mt-1 font-light uppercase tracking-widest">
                  {totalCount} oglasa
                </p>
              )}
            </div>

            <SortDropdown value={sortBy} onChange={(v: string) => setQueryState({ sort: v } as any)} />
          </div>

          {loading && page === 0 ? (
            <StateDisplay
              icon={CategoryIcon}
              title={displayTitle}
              subtitle={`Učitavanje baze podataka za kategoriju ${displayTitle.toLowerCase()}...`}
              isSpinning={true}
            />
          ) : cars.length === 0 ? (
            <StateDisplay
              icon={CategoryIcon}
              title="Nema Rezultata"
              subtitle="Trenutno nema vozila koja odgovaraju vašim kriterijima. Pokušajte izmijeniti filtere."
            />
          ) : (
            <>
              {/* Quick Filters Bar */}
              <div className="mb-8 p-4 bg-card/60 backdrop-blur-xl border border-border/40 rounded-none shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Brzi Filteri
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setQueryState({ transmission: queryState.transmission === 'Automatik' ? null : 'Automatik' } as any)}
                    className={`px-4 py-2 rounded-none text-xs font-bold transition-all duration-200 ${
                      queryState.transmission === 'Automatik'
                        ? 'bg-primary text-white border-2 border-primary shadow-lg'
                        : 'bg-secondary/50 border-2 border-border/40 text-muted-foreground hover:border-primary/50 hover:scale-105'
                    }`}
                  >
                    Samo Automatik
                  </button>
                  <button
                    onClick={() => setQueryState({ price_max: queryState.price_max === 20000 ? null : 20000 } as any)}
                    className={`px-4 py-2 rounded-none text-xs font-bold transition-all duration-200 ${
                      queryState.price_max === 20000
                        ? 'bg-primary text-white border-2 border-primary shadow-lg'
                        : 'bg-secondary/50 border-2 border-border/40 text-muted-foreground hover:border-primary/50 hover:scale-105'
                    }`}
                  >
                    Ispod 20.000€
                  </button>
                  <button
                    onClick={() => setQueryState({ year_min: queryState.year_min === 2020 ? null : 2020 } as any)}
                    className={`px-4 py-2 rounded-none text-xs font-bold transition-all duration-200 ${
                      queryState.year_min === 2020
                        ? 'bg-primary text-white border-2 border-primary shadow-lg'
                        : 'bg-secondary/50 border-2 border-border/40 text-muted-foreground hover:border-primary/50 hover:scale-105'
                    }`}
                  >
                    Novi oglasi (2020+)
                  </button>
                  <button
                    onClick={() => setQueryState({ fuel: queryState.fuel === 'Električni' ? null : 'Električni' } as any)}
                    className={`px-4 py-2 rounded-none text-xs font-bold transition-all duration-200 ${
                      queryState.fuel === 'Električni'
                        ? 'bg-primary text-white border-2 border-primary shadow-lg'
                        : 'bg-secondary/50 border-2 border-border/40 text-muted-foreground hover:border-primary/50 hover:scale-105'
                    }`}
                  >
                    Električni
                  </button>
                  <button
                    onClick={() => setQueryState({ mileage_max: queryState.mileage_max === 50000 ? null : 50000 } as any)}
                    className={`px-4 py-2 rounded-none text-xs font-bold transition-all duration-200 ${
                      queryState.mileage_max === 50000
                        ? 'bg-primary text-white border-2 border-primary shadow-lg'
                        : 'bg-secondary/50 border-2 border-border/40 text-muted-foreground hover:border-primary/50 hover:scale-105'
                    }`}
                  >
                    Mala kilometraža
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 rounded-none text-xs font-bold bg-red-500/10 border-2 border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all duration-200"
                    >
                      Očisti sve
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6 xl:gap-8">
                {cars.flatMap((car, idx) => {
                  const items: React.ReactNode[] = [
                    <Link key={car.id} to={`/listing/${car.id}`}>
                      <ListingCard car={car} />
                    </Link>
                  ];
                  if (idx === 2) {
                    items.push(<NativeAdSlotEnhanced key="native-ad" />);
                  }
                  return items;
                })}
              </div>

              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => fetchListings(true)}
                    disabled={loading}
                    className="px-8 py-4 bg-card border border-border/60 text-slate-900 dark:text-white font-black text-[11px] uppercase tracking-widest rounded-none hover:bg-secondary transition-colors shadow-sm"
                  >
                    {loading ? 'Učitavanje...' : 'Prikaži Više'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
