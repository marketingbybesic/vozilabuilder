import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ShieldCheck, BarChart3, Bell } from 'lucide-react';

// /o-nama — short editorial brand story. SEO foundation + brand trust.
export const About = () => {
  const pillars = [
    { icon: ShieldCheck, title: 'Trust kao temelj', text: 'Verificirani prodavači, Match Score na svakom oglasu, sigurna komunikacija.' },
    { icon: Sparkles,    title: 'Polish na svakom pikselu', text: 'Editorial dizajn, fotografije koje stoje na strani vozila, ne reklamnih bannera.' },
    { icon: BarChart3,   title: 'Smart algoritmi', text: 'Cijena u kontekstu, KNN slična vozila, kalkulator kredita — alati koje konkurencija nema.' },
    { icon: Bell,        title: 'Buduća pretraga', text: 'Spremite pretragu i obavijestit ćemo vas kad se pojavi pravi oglas.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>O nama | Vozila.hr — Premium tržište vozila</title>
        <meta name="description" content="Vozila.hr — premium tržište vozila u Hrvatskoj. Trust, dizajn i pametni algoritmi. Tu smo da kupnja i prodaja vozila bude jednostavna i sigurna." />
      </Helmet>

      <section className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-14 py-20 lg:py-28">
        <p className="text-[10px] font-light uppercase tracking-[0.35em] text-primary mb-4">
          O nama
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light uppercase tracking-tight text-foreground leading-[1.05] mb-8">
          Tržište vozila kakvo Hrvatska zaslužuje
        </h1>
        <p className="text-base sm:text-lg font-light text-muted-foreground leading-relaxed max-w-3xl mb-16">
          Vozila.hr je premium tržište vozila gdje se sastaju kupci i prodavači koji vrednuju jasnoću, dizajn i povjerenje. Gradimo platformu koja kupnju i prodaju vozila čini jednostavnom i sigurnom — od prvog klika do potpisa ugovora.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-20">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="p-6 lg:p-8 border border-border bg-muted/10">
                <Icon className="w-5 h-5 text-primary mb-4" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="text-base font-light uppercase tracking-[0.1em] text-foreground mb-3">
                  {p.title}
                </h3>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  {p.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border pt-12">
          <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-tight text-foreground mb-4">
            Što slijedi
          </h2>
          <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-2xl mb-6">
            Aukcije, escrow, mreža inspekcija i partneri za financiranje — gradimo trust-layer oko transakcije, ne samo oglas.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/za-partnere" className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-[10px] font-light uppercase tracking-[0.25em] hover:bg-primary/90 transition-colors">
              Postanite partner
            </Link>
            <Link to="/kontakt" className="inline-flex items-center gap-2 px-5 py-3 border border-foreground text-foreground text-[10px] font-light uppercase tracking-[0.25em] hover:bg-foreground hover:text-background transition-colors">
              Kontakt
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
