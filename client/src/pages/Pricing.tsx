import { Link } from 'react-router-dom';
import { Check, Shield, Crown, Building2 } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  oldPrice?: string;
  icon: React.ElementType;
}

const tiers: PricingTier[] = [
  {
    name: 'Osnovni',
    price: '0 €',
    period: 'po oglasu',
    description: 'Plaćanje po oglasu unaprijed. Standardna vidljivost.',
    features: [
      'Plaćanje po oglasu',
      'Standardna vidljivost',
      'Osnovne statistike',
      '30 dana trajanja',
    ],
    cta: 'Kontaktirajte nas',
    icon: Check,
  },
  {
    name: 'Premium',
    price: 'Mjesečno',
    period: 'pretplata',
    description: 'Napredne statistike, verified značka, 50€ kredita.',
    features: [
      'Napredne statistike',
      'Verified Business značka',
      '50€ kredita uključeno',
      'Prioritetna podrška',
      'Viša vidljivost oglasa',
    ],
    cta: 'Kontaktirajte nas',
    highlighted: true,
    icon: Shield,
  },
  {
    name: 'Partner',
    price: '3 Godine',
    period: 'pretplata',
    description: 'Sve Premium prednosti. Veliki dugoročni popust.',
    features: [
      'Sve Premium prednosti',
      'Maximalna vidljivost',
      'API pristup (uskoro)',
      'Dedicated account manager',
      'Brendirani profil',
    ],
    cta: 'Kontaktirajte nas',
    oldPrice: 'Mjesečno',
    icon: Crown,
  },
];

export const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-24">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <span className="text-[10px] font-light uppercase tracking-widest text-primary">
              Za partnere
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-widest mb-6">
            Pretplate za prodavače
          </h1>
          <p className="text-sm font-light text-muted-foreground max-w-md mx-auto leading-relaxed">
            Odaberite plan koji odgovara vašem poslovanju. Bez skrivenih troškova.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`relative border rounded-none p-8 flex flex-col transition-all duration-500 hover:-translate-y-1 ${
                  tier.highlighted
                    ? 'bg-primary/5 border-primary/40'
                    : 'bg-white/5 border-border hover:border-white/20'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-black text-[10px] font-light uppercase tracking-widest">
                    Preporučeno
                  </div>
                )}

                <div className="mb-8">
                  <div className="w-12 h-12 bg-white/5 border border-border rounded-none flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-light text-foreground tracking-widest mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-sm font-light text-muted-foreground leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-foreground tracking-widest">
                      {tier.price}
                    </span>
                    {tier.oldPrice && (
                      <span className="text-sm font-light text-muted-foreground line-through">
                        {tier.oldPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-light uppercase tracking-widest text-muted-foreground mt-1">
                    {tier.period}
                  </p>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-sm font-light text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/kontakt"
                  className={`block text-center px-8 py-4 text-[11px] font-light uppercase tracking-widest transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-white/5 text-foreground border border-border hover:bg-white/10'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-16 text-center">
          <p className="text-[10px] font-light uppercase tracking-widest text-muted-foreground">
            Potrebna personalizirana ponuda? Slobodno nas kontaktirajte.
          </p>
        </div>
      </div>
    </div>
  );
};
