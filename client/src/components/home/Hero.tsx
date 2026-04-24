import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Zap } from 'lucide-react';
import { SuperSearchModal } from '../search/SuperSearchModal';

export const Hero = () => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <>
      <section className="relative w-full min-h-[70vh] flex items-center overflow-hidden">
        {/* Background Image - Ferrari Always Visible */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2000&auto=format&fit=crop"
            alt="Premium vehicle showcase"
            className="w-full h-full object-cover object-[center_bottom]"
          />
        </div>

        {/* Enhanced Gradient Overlay - Stronger on Left */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        {/* Content Wrapper - With Bottom Padding for Button Clearance */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-24">
          <div className="max-w-3xl">
            {/* Premium Badge - Crystal Clear White Icon */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <Zap className="w-3 h-3 text-white animate-pulse" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                NAJNAPREDNIJA AUTO-MOTO PLATFORMA
              </span>
            </div>

            {/* Main Headline - Balanced Typography */}
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              PRONAĐITE SVOJE
              <br />
              <span className="text-primary">SAVRŠENO VOZILO</span>
            </h1>

            {/* Subheadline - Enhanced Visibility with Drop Shadow */}
            <p className="text-base md:text-lg text-slate-200 font-medium leading-relaxed mb-8 max-w-2xl drop-shadow-md">
              Od luksuznih automobila do e-bicikala i nautike. Najveća ponuda vozila, opreme i iskustava na jednom mjestu.
            </p>

            {/* CTA Buttons - Perfectly Aligned */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Primary CTA - Opens SuperSearchModal */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-2xl shadow-primary/50"
              >
                <Search className="h-5 w-5" strokeWidth={2.5} />
                Pretraži Oglase
                <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={2.5} />
              </button>

              {/* Secondary CTA - Link to Listing Wizard */}
              <Link
                to="/predaj-oglas"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-white/20 hover:border-white/50 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
              >
                Predaj Oglas
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle Gradient Break - Bottom 15% Only */}
        <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-background via-transparent to-transparent z-10" />
      </section>

      {/* Super Search Modal */}
      <SuperSearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
    </>
  );
};
