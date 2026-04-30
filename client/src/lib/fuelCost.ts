// Fuel-cost-per-100km calculator — pure, no API.
// Inputs: fuel type + estimated consumption (l/100km or kWh/100km).
// Reference prices are HR averages (April 2026, refresh quarterly via a const).
// Returns: euro cost per 100km, monthly cost at 1500km, yearly at 15000km.

export interface FuelInputs {
  fuel?: string;                // "Benzin" | "Diesel" | "Hibrid" | "PHEV" | "EV" | "LPG" | "CNG"
  consumption_l_per_100km?: number; // 0..30
  consumption_kwh_per_100km?: number; // 12..30 typical
  engine_cc?: number;           // used to estimate consumption if not provided
  power_hp?: number;            // used to estimate consumption if not provided
  body_type?: string;
}

export interface FuelEstimate {
  source: 'declared' | 'estimated';
  consumption: number;          // numeric
  unit: 'l' | 'kWh';
  pricePerUnit: number;         // €/l or €/kWh
  costPer100km: number;         // €
  costPerMonth: number;         // € at 1500km/mo
  costPerYear: number;          // € at 15000km/yr
}

// HR average pump prices, April 2026 (€) — refresh manually each quarter
export const HR_FUEL_PRICES: Record<string, { unit: 'l'|'kWh'; price: number }> = {
  Benzin:  { unit: 'l',   price: 1.55 },
  Diesel:  { unit: 'l',   price: 1.45 },
  LPG:     { unit: 'l',   price: 0.78 },
  CNG:     { unit: 'l',   price: 1.05 },
  EV:      { unit: 'kWh', price: 0.32 }, // mixed home + public charging
  Hibrid:  { unit: 'l',   price: 1.55 }, // burns benzin
  PHEV:    { unit: 'l',   price: 1.10 }, // mostly EV with petrol fallback
};

// Heuristic consumption estimator when the seller didn't declare it.
// Rough buckets — better than nothing for the calc.
function estimateConsumption(i: FuelInputs): { value: number; unit: 'l' | 'kWh' } {
  const fuel = i.fuel || 'Benzin';
  if (fuel === 'EV') {
    if ((i.power_hp || 0) >= 250) return { value: 22, unit: 'kWh' };
    if ((i.power_hp || 0) >= 150) return { value: 18, unit: 'kWh' };
    return { value: 15, unit: 'kWh' };
  }
  // Liquid fuel: scale with engine size
  const cc = i.engine_cc || 2000;
  let l: number;
  if (cc <= 1200)      l = 5.5;
  else if (cc <= 1600) l = 6.5;
  else if (cc <= 2000) l = 7.5;
  else if (cc <= 3000) l = 9.5;
  else                 l = 12.0;
  // Diesel = ~15% lower
  if (fuel === 'Diesel') l *= 0.85;
  if (fuel === 'Hibrid') l *= 0.65;
  if (fuel === 'PHEV')   l *= 0.45;
  if (fuel === 'LPG')    l *= 1.10; // LPG burns ~10% more vol than petrol
  // SUV penalty
  if ((i.body_type || '').match(/SUV|Pickup|Terenac/i)) l *= 1.15;
  return { value: Math.round(l * 10) / 10, unit: 'l' };
}

export function fuelCost(i: FuelInputs): FuelEstimate | null {
  if (!i.fuel) return null;
  const priceRow = HR_FUEL_PRICES[i.fuel];
  if (!priceRow) return null;

  let value: number, unit: 'l' | 'kWh', source: 'declared' | 'estimated';
  if (priceRow.unit === 'kWh' && i.consumption_kwh_per_100km) {
    value = i.consumption_kwh_per_100km;
    unit = 'kWh';
    source = 'declared';
  } else if (priceRow.unit === 'l' && i.consumption_l_per_100km) {
    value = i.consumption_l_per_100km;
    unit = 'l';
    source = 'declared';
  } else {
    const est = estimateConsumption(i);
    value = est.value;
    unit = est.unit;
    source = 'estimated';
  }

  const costPer100km = value * priceRow.price;
  const costPerMonth = costPer100km * 15;   // 1500km/mo
  const costPerYear  = costPer100km * 150;  // 15000km/yr
  return {
    source,
    consumption: value, unit,
    pricePerUnit: priceRow.price,
    costPer100km: round2(costPer100km),
    costPerMonth: Math.round(costPerMonth),
    costPerYear: Math.round(costPerYear),
  };
}

function round2(n: number): number { return Math.round(n * 100) / 100; }
