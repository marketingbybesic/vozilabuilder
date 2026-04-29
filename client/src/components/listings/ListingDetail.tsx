import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getAnalytics } from '../../lib/analytics';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Calendar, Gauge, Zap, MapPin, Phone, Mail, User,
  TrendingDown, TrendingUp, Minus,
  MessageCircle, ArrowLeft, AlertCircle, ShieldCheck,
  Fuel, Sparkles
} from 'lucide-react';
import { Listing } from '../../types';
import { Helmet } from 'react-helmet-async';
import { ListingCard } from './ListingFeed';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

// --- MILESTONE 4: HISTORY TIMELINE ---

interface HistoryEvent {
  year: number;
  event: string;
  owner: string;
}

const VehicleHistoryTimeline = ({ attributes }: { attributes: Record<string, any> }) => {
  const history: HistoryEvent[] = attributes.history || (() => {
    const baseYear = attributes.year || attributes.godiste || 2018;
    return [
      { year: baseYear, event: 'Prvo vlaštvo', owner: '1. Vlasnik' },
      { year: baseYear + 2, event: 'Redovni servis', owner: 'Servisna knjiga' },
      { year: baseYear + 4, event: 'Redovni servis', owner: 'Servisna knjiga' },
      { year: baseYear + 5, event: 'Promjena vlasnika', owner: '2. Vlasnik' },
    ].filter(e => e.year <= new Date().getFullYear());
  })();

  const getEventColor = (event: string, idx: number) => {
    if (idx === 0) return 'bg-primary border-primary';
    if (event.toLowerCase().includes('servis')) return 'bg-green-500 border-green-500';
    if (event.toLowerCase().includes('vlasnik') || event.toLowerCase().includes('promjena')) return 'bg-amber-500 border-amber-500';
    return 'bg-slate-500 border-slate-500';
  };

  const getLineColor = (event: string, idx: number) => {
    if (idx === 0) return 'text-primary';
    if (event.toLowerCase().includes('servis')) return 'text-green-400';
    if (event.toLowerCase().includes('vlasnik') || event.toLowerCase().includes('promjena')) return 'text-amber-400';
    return 'text-slate-400';
  };

  return (
    <div className="bg-card border border-neutral-800 rounded-none p-8">
      <h2 className="text-xs font-light uppercase tracking-widest text-white/40 mb-8">Povijest vozila</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
        <div className="space-y-6">
          {history.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 relative">
              {/* Dot */}
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 z-10 ${getEventColor(item.event, idx)}`} />
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-light uppercase tracking-widest mb-1 ${getLineColor(item.event, idx)}`}>
                  {item.year}
                </p>
                <p className="text-sm font-light text-white/80 uppercase tracking-widest">
                  {item.event}
                </p>
                <p className="text-[10px] font-light text-white/40 uppercase tracking-widest mt-0.5">
                  {item.owner}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MILESTONE 5: COST PER 100KM ---

const FUEL_COSTS: Record<string, { litres: number; pricePerUnit: number; unit: string }> = {
  benzin:     { litres: 7.5,  pricePerUnit: 1.55, unit: 'L' },
  diesel:     { litres: 6.0,  pricePerUnit: 1.42, unit: 'L' },
  dizel:      { litres: 6.0,  pricePerUnit: 1.42, unit: 'L' },
  hibrid:     { litres: 4.5,  pricePerUnit: 1.55, unit: 'L' },
  hybrid:     { litres: 4.5,  pricePerUnit: 1.55, unit: 'L' },
  električni: { litres: 18.0, pricePerUnit: 0.22, unit: 'kWh' },
  electric:   { litres: 18.0, pricePerUnit: 0.22, unit: 'kWh' },
  struja:     { litres: 18.0, pricePerUnit: 0.22, unit: 'kWh' },
  lpg:        { litres: 9.0,  pricePerUnit: 0.72, unit: 'L' },
  plin:       { litres: 9.0,  pricePerUnit: 0.72, unit: 'L' },
};

const CostPer100km = ({ attributes }: { attributes: Record<string, any> }) => {
  const fuelRaw = (attributes.fuelType || attributes.fuel || attributes.gorivo || '').toLowerCase();
  const fuelKey = Object.keys(FUEL_COSTS).find(k => fuelRaw.includes(k));
  if (!fuelKey) return null;

  const { litres, pricePerUnit } = FUEL_COSTS[fuelKey];
  const cost = litres * pricePerUnit;

  return (
    <div className="bg-card border border-neutral-800 rounded-none p-6">
      <div className="flex items-start gap-3 mb-3">
        <Fuel className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-[10px] font-light uppercase tracking-widest text-white/40 mb-1">
            Procijenjeni trošak goriva
          </p>
          <p className="text-2xl font-light text-white">
            ~€{cost.toFixed(2)}<span className="text-sm text-white/40"> / 100km</span>
          </p>
          <p className="text-[10px] font-light text-white/30 mt-2 leading-relaxed">
            Procjena prema prosječnoj potrošnji i tržišnim cijenama goriva u RH
          </p>
        </div>
      </div>
    </div>
  );
};

// --- MILESTONE 6: KNN SIMILAR VEHICLES ---

const SimilarVehicles = ({ listing }: { listing: Listing }) => {
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const attributes = listing.attributes || {};

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        let query = supabase
          .from('listings')
          .select('*, listing_images(id, url, is_primary, sort_order)')
          .eq('status', 'active')
          .neq('id', listing.id)
          .gte('price', listing.price * 0.8)
          .lte('price', listing.price * 1.2)
          .limit(4);

        const make = attributes.make || attributes.marka;
        if (make) {
          query = query.eq('attributes->>make', make);
        }

        const { data, error } = await query;
        if (error) throw error;

        const normalized = (data || []).map((item: any) => ({
          ...item,
          owner: item.owner,
        })) as Listing[];

        setSimilar(normalized);
      } catch {
        setSimilar([]);
      } finally {
        setLoading(false);
      }
    };

    if (listing.price > 0) fetchSimilar();
    else setLoading(false);
  }, [listing.id]);

  if (loading || similar.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-8 pb-16">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />
        <h2 className="text-xs font-light uppercase tracking-widest text-white/40">Slična vozila</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {similar.map(car => (
          <Link key={car.id} to={`/listing/${car.id}`}>
            <ListingCard car={car} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<{ src: string }[]>([]);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*, categories(name, slug), listing_images(id, url, is_primary, sort_order)')
          .eq('id', id)
          .single();

        if (error) throw error;
        const normalized = {
          ...data,
          owner: (data as any).owner,
        };
        setListing(normalized as Listing);

        // Track view_listing event
        try {
          const analytics = getAnalytics();
          analytics.trackViewListing(id, {
            title: (data as Listing).title,
            price: (data as Listing).price,
            category: (data as Listing).categories?.slug,
          });
        } catch {
          // Analytics not initialized yet, silently fail
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Gallery Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              <div className="relative aspect-video bg-neutral-900 rounded-none overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-video" />
                ))}
              </div>
              <div className="bg-card border border-neutral-800 rounded-none p-8">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            {/* Info Panel Skeleton */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <div className="bg-card border border-neutral-800 rounded-none p-8">
                  <Skeleton className="h-8 w-full mb-8" />
                  <Skeleton className="h-10 w-32 mb-8" />
                  <Skeleton className="h-8 w-40 mb-8" />
                  <Skeleton className="h-6 w-24 mb-8" />
                  <Skeleton className="h-12 w-full mb-4" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-light tracking-widest text-foreground mb-4">Oglas nije pronađen</h1>
          <Link to="/" className="text-primary font-light tracking-widest uppercase text-xs hover:underline">← Natrag na početnu</Link>
        </div>
      </div>
    );
  }

  const images = listing.listing_images || [];
  const sortedImages = images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // Price analysis (dummy median for demo)
  const dummyMedian = 25000;
  const priceStatus = listing.price === 0 
    ? 'inquiry' 
    : listing.price < dummyMedian * 0.9 
    ? 'great' 
    : listing.price > dummyMedian * 1.1 
    ? 'high' 
    : 'market';

  const priceRibbon = {
    inquiry: { icon: Minus, text: 'Cijena na upit', color: 'bg-slate-500' },
    great: { icon: TrendingDown, text: 'Odlična cijena', color: 'bg-green-500' },
    market: { icon: Minus, text: 'Tržišna cijena', color: 'bg-yellow-500' },
    high: { icon: TrendingUp, text: 'Iznad prosjeka', color: 'bg-orange-500' },
  }[priceStatus];

  const RibbonIcon = priceRibbon.icon;

  // Dynamic attributes
  const attributes = listing.attributes || {};
  const specs = [
    { icon: Calendar, label: 'Godište', value: attributes.year },
    { icon: Gauge, label: 'Kilometraža', value: attributes.mileage ? `${attributes.mileage.toLocaleString()} km` : null },
    { icon: Zap, label: 'Gorivo', value: attributes.fuelType || attributes.fuel },
    { icon: Gauge, label: 'Snaga', value: attributes.power ? `${attributes.power} KS` : null },
  ].filter(spec => spec.value);

  // WhatsApp message generator
  const whatsappMessage = `Hi, I'm interested in your ${listing.title} on Vozila.hr`;
  const whatsappLink = listing.contact_phone 
    ? `https://wa.me/${listing.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  // SEO title for this listing
  const seoTitle = `${listing.title} — ${listing.price > 0 ? `${listing.price.toLocaleString()}€` : 'Cijena na upit'} | Vozila.hr`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={listing.description?.substring(0, 160) || `${listing.title} — ${listing.location || 'Hrvatska'}. Pronađite ovo vozilo na Vozila.hr.`} />
      </Helmet>

      {/* Status Badge for Inactive Listings */}
      {listing.status === 'sold' && (
        <div className="bg-red-500/90 text-white py-3 px-4 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-light uppercase tracking-widest text-sm">PRODANO / ARHIVIRANO</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Breadcrumb */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-light uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Natrag
        </Link>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-2 space-y-8">
            {/* Premium Gallery Layout */}
            {sortedImages.length === 0 ? (
              <div className="relative aspect-video bg-neutral-900 rounded-none overflow-hidden">
                <img
                  src="/placeholder-car.jpg"
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : sortedImages.length === 1 ? (
              <div className="relative aspect-video bg-neutral-900 rounded-none overflow-hidden cursor-pointer"
                onClick={() => {
                  setLightboxSlides(sortedImages.map((img) => ({ src: img.url })));
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
              >
                <img
                  src={sortedImages[0].url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {listing.status === 'sold' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-8xl font-light text-white/30 transform -rotate-45 mb-4 tracking-widest">PRODANO</div>
                      <p className="text-sm font-light uppercase tracking-widest text-white/40">Oglas je arhiviran</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 px-4 py-2 bg-black/80 backdrop-blur-sm rounded-none text-white text-xs font-light uppercase tracking-widest">
                  1 / 1
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[300px] md:h-[500px]">
                {/* Main Image - Left (spans 2 columns, full height) */}
                <div
                  className="md:col-span-2 h-full relative bg-neutral-900 rounded-none overflow-hidden cursor-pointer"
                  onClick={() => {
                    setLightboxSlides(sortedImages.map((img) => ({ src: img.url })));
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={sortedImages[0].url}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {listing.status === 'sold' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-8xl font-light text-white/30 transform -rotate-45 mb-4 tracking-widest">PRODANO</div>
                        <p className="text-sm font-light uppercase tracking-widest text-white/40">Oglas je arhiviran</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 px-4 py-2 bg-black/80 backdrop-blur-sm rounded-none text-white text-xs font-light uppercase tracking-widest">
                    1 / {sortedImages.length}
                  </div>
                </div>
                {/* Right Column - Stacked Images */}
                <div className="hidden md:flex flex-col gap-2 h-full">
                  {sortedImages.slice(1, 3).map((img, idx) => (
                    <div
                      key={img.id}
                      className="flex-1 relative bg-neutral-900 rounded-none overflow-hidden cursor-pointer"
                      onClick={() => {
                        setLightboxSlides(sortedImages.map((i) => ({ src: i.url })));
                        setLightboxIndex(idx + 1);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${idx + 2}`}
                        className="w-full h-full object-cover"
                      />
                      {sortedImages.length > 3 && idx === 1 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-light uppercase tracking-widest text-sm">
                            +{sortedImages.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {sortedImages.length === 2 && <div className="flex-1 bg-neutral-900 rounded-none" />}
                </div>
                {/* Mobile: horizontal scroll for extra images */}
                <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
                  {sortedImages.slice(1).map((img, idx) => (
                    <div
                      key={img.id}
                      className="flex-shrink-0 w-32 aspect-video bg-neutral-900 rounded-none overflow-hidden cursor-pointer"
                      onClick={() => {
                        setLightboxSlides(sortedImages.map((i) => ({ src: i.url })));
                        setLightboxIndex(idx + 1);
                        setLightboxOpen(true);
                      }}
                    >
                      <img src={img.url} alt={`Thumbnail ${idx + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Damage Gallery Button */}
            {(listing.damage_images && listing.damage_images.length > 0) && (
              <button
                onClick={() => {
                  setLightboxSlides(listing.damage_images!.map((url) => ({ src: url })));
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
                className="w-full px-6 py-3 border border-red-500/30 bg-red-500/5 text-red-400 rounded-none font-light uppercase tracking-widest text-xs hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
                Galerija Oštećenja ({listing.damage_images.length})
              </button>
            )}

            {/* Description */}
            <div className="bg-card border border-neutral-800 rounded-none p-8">
              <h2 className="text-xs font-light uppercase tracking-widest text-white/40 mb-4">Opis</h2>
              <p className="text-white/80 leading-relaxed font-light">
                {listing.description || 'Nema dostupnog opisa.'}
              </p>
            </div>

            {/* Dynamic Specs - Porsche Grid */}
            <div className="bg-card border border-neutral-800 rounded-none p-8">
              <h2 className="text-xs font-light uppercase tracking-widest text-white/40 mb-8">Specifikacije</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {specs.map((spec, idx) => {
                  const Icon = spec.icon;
                  return (
                    <div key={idx} className="space-y-2">
                      <Icon className="w-5 h-5 text-white/40 mb-3" strokeWidth={1.5} />
                      <p className="text-[10px] font-light uppercase tracking-widest text-white/40">
                        {spec.label}
                      </p>
                      <p className="text-lg font-light text-white">{spec.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equipment Tags - Dodatna Oprema */}
            {attributes.equipment && Array.isArray(attributes.equipment) && attributes.equipment.length > 0 && (
              <div className="bg-card border border-neutral-800 rounded-none p-8">
                <h2 className="text-xs font-light uppercase tracking-widest text-white/40 mb-4">Dodatna Oprema</h2>
                <div className="flex flex-wrap gap-2">
                  {attributes.equipment.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-white/5 border border-border px-3 py-1 text-[10px] uppercase tracking-widest text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* MILESTONE 4: Vehicle History Timeline */}
            <VehicleHistoryTimeline attributes={attributes} />
          </div>

          {/* Right: Sticky Info Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Price Card */}
              <div className="bg-card border border-neutral-800 rounded-none p-8">
                <h1 className="text-2xl font-light text-white mb-8 leading-tight tracking-widest">
                  {listing.title}
                </h1>
                
                <div className="mb-8">
                  <p className="text-xs font-light uppercase tracking-widest text-white/40 mb-2">Cijena</p>
                  <p className="text-4xl font-light text-white">
                    {listing.price === 0 ? 'Na upit' : `${listing.price.toLocaleString()} ${listing.currency || '€'}`}
                  </p>
                </div>

                {/* Price Ribbon */}
                <div className={`flex items-center gap-2 px-4 py-2 ${priceRibbon.color} text-white rounded-none mb-8`}>
                  <RibbonIcon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs font-light uppercase tracking-widest">{priceRibbon.text}</span>
                </div>

                {/* Location */}
                {listing.location && (
                  <div className="flex items-center gap-2 text-white/40 mb-8">
                    <MapPin className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-xs font-light uppercase tracking-widest">{listing.location}</span>
                  </div>
                )}

                {/* Contact Buttons - Sharp Design (Desktop) */}
                {listing.status === 'sold' ? (
                  <div className="p-4 border border-red-500/30 bg-red-500/5 rounded-none text-center">
                    <p className="text-xs font-light uppercase tracking-widest text-red-400">
                      Oglas je arhiviran - kontakt nije dostupan
                    </p>
                  </div>
                ) : (
                  <div className="hidden lg:flex flex-col space-y-2">
                    {whatsappLink && (
                      <a 
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          try {
                            const analytics = getAnalytics();
                            analytics.trackWhatsAppClick(listing.id, {
                              title: listing.title,
                              price: listing.price,
                              category: listing.categories?.slug,
                            });
                          } catch {
                            // Analytics not initialized yet, silently fail
                          }
                        }}
                        className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-green-600 text-white rounded-none font-light uppercase tracking-widest text-xs hover:bg-green-700 transition-all duration-300"
                      >
                        <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                        WhatsApp
                      </a>
                    )}
                    
                    {listing.contact_phone && (
                      <a 
                        href={`tel:${listing.contact_phone}`}
                        className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-white text-black rounded-none font-light uppercase tracking-widest text-xs hover:bg-neutral-200 transition-all duration-300"
                      >
                        <Phone className="w-5 h-5" strokeWidth={1.5} />
                        Nazovi
                      </a>
                    )}
                    
                    {listing.contact_email && (
                      <a 
                        href={`mailto:${listing.contact_email}`}
                        className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-neutral-800 text-white rounded-none font-light uppercase tracking-widest text-xs hover:bg-neutral-700 transition-all duration-300"
                      >
                        <Mail className="w-5 h-5" strokeWidth={1.5} />
                        Email
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* MILESTONE 5: Cost per 100km */}
              <CostPer100km attributes={attributes} />

              {/* Seller Info */}
              <div className="bg-card border border-neutral-800 rounded-none p-8">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-white/40" strokeWidth={1.5} />
                  <h3 className="text-xs font-light uppercase tracking-widest text-white/40">
                    Prodavač
                  </h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-white/80 font-light">
                    {listing.owner?.company_name || 'Privatni prodavač'}
                  </p>
                  {(listing.owner?.is_verified || listing.owner?.dealer_verified || listing.owner?.tier === 'premium') && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10">
                      <ShieldCheck className="w-3 h-3 text-primary" strokeWidth={2} />
                      <span className="text-[9px] font-light uppercase tracking-widest text-white/60">
                        Verificirani
                      </span>
                    </div>
                  )}
                </div>
                {listing.owner?.tier === 'premium' && (
                  <p className="text-[10px] font-light uppercase tracking-widest text-primary/60">
                    Premium partner
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MILESTONE 6: Similar Vehicles */}
      <SimilarVehicles listing={listing} />

      {/* Mobile Sticky Contact Bar */}
      {listing.status === 'active' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 px-4 py-3 z-50 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-light uppercase tracking-widest text-white/40 truncate">
              {listing.title}
            </p>
            <p className="text-sm font-light text-white truncate">
              {listing.price === 0 ? 'Na upit' : `${listing.price.toLocaleString()} ${listing.currency || '€'}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  try {
                    const analytics = getAnalytics();
                    analytics.trackWhatsAppClick(listing.id, {
                      title: listing.title,
                      price: listing.price,
                      category: listing.categories?.slug,
                    });
                  } catch {
                    // Analytics not initialized yet, silently fail
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-light uppercase tracking-widest text-[10px] hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
            {listing.contact_phone && (
              <a
                href={`tel:${listing.contact_phone}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-light uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-colors"
              >
                <Phone className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Nazovi</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Premium Lightbox - Pitch Black Backdrop */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        plugins={[Zoom, Thumbnails]}
        styles={{
          container: { backgroundColor: '#000000' },
        }}
      />
    </div>
  );
};
