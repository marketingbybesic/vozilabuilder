import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Calendar, Gauge, Zap, MapPin, Phone, Mail, User, 
  ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Minus
} from 'lucide-react';
import { Listing } from '../../types';

export const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        setListing(data as Listing);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-bold text-muted-foreground">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-black text-foreground mb-4">Oglas nije pronađen</h1>
          <Link to="/" className="text-primary font-bold hover:underline">← Natrag na početnu</Link>
        </div>
      </div>
    );
  }

  const images = listing.listing_images || [];
  const sortedImages = images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const currentImage = sortedImages[currentImageIndex]?.url || '/placeholder-car.jpg';

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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Natrag na pretragu
          </Link>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative aspect-video bg-card rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
              <img 
                src={currentImage} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {sortedImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-bold">
                {currentImageIndex + 1} / {sortedImages.length || 1}
              </div>
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {sortedImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      idx === currentImageIndex 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-border/50 hover:border-primary/50'
                    }`}
                  >
                    <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-black text-foreground mb-4">Opis</h2>
              <p className="text-muted-foreground leading-relaxed">
                {listing.description || 'Nema dostupnog opisa.'}
              </p>
            </div>

            {/* Dynamic Specs */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-black text-foreground mb-4">Specifikacije</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specs.map((spec, idx) => {
                  const Icon = spec.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center text-center p-4 bg-accent/30 rounded-xl">
                      <Icon className="w-6 h-6 text-primary mb-2" />
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        {spec.label}
                      </p>
                      <p className="text-sm font-black text-foreground">{spec.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Sticky Info Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-2xl">
                <h1 className="text-3xl font-black text-foreground mb-2">
                  {listing.title}
                </h1>
                
                <div className="mb-4">
                  <p className="text-4xl font-black text-primary">
                    {listing.price === 0 ? 'Na upit' : `${listing.price.toLocaleString()} ${listing.currency || '€'}`}
                  </p>
                </div>

                {/* Price Ribbon */}
                <div className={`flex items-center gap-2 px-4 py-2 ${priceRibbon.color} text-white rounded-lg mb-6`}>
                  <RibbonIcon className="w-4 h-4" />
                  <span className="text-sm font-bold">{priceRibbon.text}</span>
                </div>

                {/* Location */}
                {listing.location && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{listing.location}</span>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="space-y-3">
                  {listing.contact_phone && (
                    <a 
                      href={`tel:${listing.contact_phone}`}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      <Phone className="w-5 h-5" />
                      Nazovi
                    </a>
                  )}
                  
                  {listing.contact_email && (
                    <a 
                      href={`mailto:${listing.contact_email}`}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-accent text-foreground rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-accent/80 transition-all duration-300"
                    >
                      <Mail className="w-5 h-5" />
                      Email
                    </a>
                  )}
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Prodavač
                </h3>
                <p className="text-sm text-muted-foreground">
                  {listing.contact_name || 'Privatni prodavač'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
