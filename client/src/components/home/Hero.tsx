import { useState } from 'react';
import { Search, ArrowRight, Zap } from 'lucide-react';
import { SuperSearchModal } from '../search/SuperSearchModal';

export const Hero = () => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <>
      <section className="relative w-full h-[70vh] min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2000&auto=format&fit=crop"
            alt="Premium vehicle showcase"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />

        {/* Content Wrapper */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <Zap className="h-4 w-4 text-primary" strokeWidth={2.5} />
              <span className="text-xs font-black uppercase tracking-widest text-white">
                Hrvatska #1 Platforma
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Pronađite Svoje
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Savršeno Vozilo
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed mb-12 max-w-2xl">
              Od luksuznih automobila do e-bicikala i nautike. Najveća ponuda vozila, opreme i iskustava na jednom mjestu.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Primary CTA - Opens Search Modal */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-2xl shadow-primary/50"
              >
                <Search className="h-5 w-5" strokeWidth={2.5} />
                Pretraži Oglase
                <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={2.5} />
              </button>

              {/* Secondary CTA */}
              <button className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-white/20 hover:border-white/50 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                Predaj Oglas
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="mt-16 pt-8 border-t border-white/20 grid grid-cols-3 gap-8">
              <div>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">15,000+</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Aktivnih Oglasa</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">6</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kategorija</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">24/7</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Podrška</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Element - Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* Super Search Modal */}
      <SuperSearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
    </>
  );
};
