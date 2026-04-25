import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { Listing } from '../types';
import { Hero } from '../components/home/Hero';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { NoviOglasiCarousel } from '../components/home/NoviOglasiCarousel';

export const Home = () => {
  const [trendingListings, setTrendingListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch trending 8 listings (by views)
        const { data: trending } = await supabase
          .from('listings')
          .select('*, listing_images(id, url, is_primary, sort_order)')
          .eq('status', 'active')
          .order('views_count', { ascending: false })
          .limit(8);

        setTrendingListings(trending || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Component */}
      <Hero />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Novi Oglasi Showroom - Autoscroll Carousel */}
      <NoviOglasiCarousel />

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px bg-white/5" />
      </div>

      {/* Section: Najgledanije */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <div>
              <h2 className="text-[10px] font-light uppercase tracking-widest text-muted-foreground mb-1">
                Popularno
              </h2>
              <p className="text-xl font-light uppercase tracking-widest text-foreground">
                Najgledanije
              </p>
            </div>
          </div>
          <Link
            to="/?sortBy=views"
            className="text-xs font-light text-primary hover:text-primary/80 transition-colors duration-200 uppercase tracking-widest flex items-center gap-2"
          >
            Vidi sve
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {trendingListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Sponsored Space - Minimal */}
      <section className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-48 bg-white/[0.02] border border-white/10 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
            <div className="text-center relative">
              <p className="text-[10px] font-light uppercase tracking-[0.2em] text-white/30 mb-2">
                Sponzorirani prostor
              </p>
              <p className="text-lg font-light uppercase tracking-widest text-white/50">
                Vaša reklama ovdje
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Compact Listing Card for Home Page - Sharp Aesthetic
const ListingCard = ({ listing }: { listing: Listing }) => {
  const images = listing.listing_images || [];
  const sortedImages = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
  const displayImg = sortedImages[0]?.url || '/placeholder-car.jpg';

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group block bg-black border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-black overflow-hidden">
        <img
          src={displayImg}
          alt={listing.title}
          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20 scale-110"
        />
        <img
          src={displayImg}
          alt={listing.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground truncate group-hover:text-primary transition-colors duration-300">
          {listing.title}
        </h3>
        <p className="mt-2 text-sm font-light text-primary">
          {listing.price === 0 ? 'Na upit' : `${listing.price.toLocaleString()} €`}
        </p>
      </div>
    </Link>
  );
};
