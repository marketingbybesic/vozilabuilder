import { Fuel, TrendingUp } from 'lucide-react';
import { fuelCost } from '../../lib/fuelCost';

interface Props {
  attributes: Record<string, any>;
}

// Editorial fuel cost card — appears on listing detail. Shows ratings for
// per-100km, monthly, and yearly cost. Source = declared if seller filled
// consumption, otherwise estimated from fuel + engine + body type.
export const FuelCostCard = ({ attributes }: Props) => {
  const est = fuelCost({
    fuel: attributes.fuel,
    consumption_l_per_100km: attributes.consumption_l_per_100km || attributes.consumption,
    consumption_kwh_per_100km: attributes.consumption_kwh_per_100km,
    engine_cc: attributes.engine_cc,
    power_hp: attributes.power_hp,
    body_type: attributes.body_type,
  });

  if (!est) return null;

  return (
    <div className="border border-border bg-muted/20 p-6 lg:p-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="text-[10px] font-light uppercase tracking-[0.3em] text-foreground">
            Trošak goriva
          </h3>
        </div>
        <span
          className={`text-[9px] font-light uppercase tracking-[0.25em] ${
            est.source === 'declared' ? 'text-primary' : 'text-muted-foreground/70'
          }`}
          title={est.source === 'declared' ? 'Iz oglasa' : 'Procjena na temelju motora i tipa vozila'}
        >
          {est.source === 'declared' ? 'Iz oglasa' : 'Procjena'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 lg:gap-6 text-foreground">
        <div>
          <p className="text-[9px] font-light uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Na 100 km
          </p>
          <p className="text-xl lg:text-2xl font-light tabular-nums">
            {est.costPer100km.toFixed(2)} €
          </p>
          <p className="text-[10px] font-light tabular-nums text-muted-foreground mt-1">
            {est.consumption}{est.unit === 'l' ? ' L' : ' kWh'}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-light uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Mjesečno
          </p>
          <p className="text-xl lg:text-2xl font-light tabular-nums">
            {est.costPerMonth.toLocaleString('hr-HR')} €
          </p>
          <p className="text-[10px] font-light text-muted-foreground mt-1">~1.500 km</p>
        </div>
        <div>
          <p className="text-[9px] font-light uppercase tracking-[0.25em] text-muted-foreground mb-2 inline-flex items-center gap-1">
            <TrendingUp className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
            Godišnje
          </p>
          <p className="text-xl lg:text-2xl font-light tabular-nums text-primary">
            {est.costPerYear.toLocaleString('hr-HR')} €
          </p>
          <p className="text-[10px] font-light text-muted-foreground mt-1">~15.000 km</p>
        </div>
      </div>

      <p className="mt-5 text-[10px] font-light text-muted-foreground/80 leading-relaxed">
        Cijena {est.unit === 'l' ? 'goriva' : 'el. energije'} {est.pricePerUnit.toFixed(2)} €/{est.unit}.
        Stvarni trošak ovisi o stilu vožnje, terenu i sezoni.
      </p>
    </div>
  );
};
