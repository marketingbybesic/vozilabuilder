import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, ArrowUpRight, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Dealer {
  id: string;
  email: string;
  dealer_verified: boolean;
  company_name?: string | null;
  created_at?: string | null;
  listing_count?: number;
}

// /saloni — public directory of all dealer accounts. SEO + dealer pride.
export const DealerIndex = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const { data: u } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'dealer')
          .order('dealer_verified', { ascending: false });
        setDealers((u || []) as Dealer[]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Saloni i autosalon partneri | Vozila.hr</title>
        <meta name="description" content={`${dealers.length} aktivnih salona na Vozila.hr. Verificirani autosalon partneri, transparentni profili.`} />
      </Helmet>

      <section className="max-w-[1480px] mx-auto px-6 sm:px-10 lg:px-14 py-16 lg:py-24">
        <div className="mb-12 lg:mb-16">
          <p className="text-[10px] font-light uppercase tracking-[0.35em] text-primary mb-3 inline-flex items-center gap-2">
            <Building2 className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
            Saloni
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light uppercase tracking-tight text-foreground mb-4">
            Aktivni autosaloni
          </h1>
          <p className="text-sm font-light text-muted-foreground max-w-2xl leading-relaxed">
            Verificirani autosalon partneri kojima vjerujemo. Provjeravamo OIB, sjedište i poslovne reference.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/2] border border-border bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : dealers.length === 0 ? (
          <p className="text-sm font-light text-muted-foreground">Trenutno nema aktivnih salona.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {dealers.map((d) => {
              const slug = d.email.split('@')[0];
              const name = d.company_name || slug;
              return (
                <Link
                  key={d.id}
                  to={`/saloni/${slug}`}
                  className="group p-5 sm:p-6 border border-border hover:border-primary transition-colors flex items-start gap-4"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 border border-border bg-muted/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-light uppercase tracking-widest text-muted-foreground">
                      {name.slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="text-sm font-light uppercase tracking-[0.1em] text-foreground truncate">
                        {name}
                      </h3>
                      {d.dealer_verified && (
                        <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" strokeWidth={1.5} aria-label="Verificirani" />
                      )}
                    </div>
                    <p className="text-[10px] font-light uppercase tracking-[0.25em] text-muted-foreground">
                      {d.created_at ? `na platformi od ${new Date(d.created_at).getFullYear()}` : 'novi salon'}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
