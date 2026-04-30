// VIN decoder via NHTSA vPIC — free, no API key.
// Endpoint: https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/<vin>?format=json
// Works fully for North-American VINs and ~80% for European VINs (decodes
// make/model/year/engine/body type from the WMI + vehicle descriptor section).
// We hit it client-side; the response is JSON and CORS-permitted.

export interface VinResult {
  vin: string;
  make?: string;
  model?: string;
  year?: number;
  engine_cc?: number;
  fuel?: string;
  body_type?: string;
  drivetrain?: string;
  transmission?: string;
  doors?: number;
  raw?: Record<string, string>;
}

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i; // VIN is 17 chars, no I/O/Q

export function isValidVin(vin: string): boolean {
  return VIN_REGEX.test(vin.trim());
}

export async function decodeVin(rawVin: string): Promise<VinResult | { error: string }> {
  const vin = rawVin.trim().toUpperCase();
  if (!isValidVin(vin)) return { error: 'Neispravan VIN (mora imati 17 znakova bez I/O/Q).' };

  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return { error: `vPIC API error ${res.status}` };
    const data = await res.json();
    const results: { Variable: string; Value: string | null }[] = data?.Results || [];
    const map: Record<string, string> = {};
    for (const r of results) if (r.Value && r.Value !== 'Not Applicable') map[r.Variable] = r.Value;

    const fuelMap: Record<string, string> = {
      'Gasoline': 'Benzin', 'Diesel': 'Diesel', 'Electric': 'EV',
      'Hybrid': 'Hibrid', 'Plug-in Hybrid Electric Vehicle (PHEV)': 'PHEV',
      'Compressed Natural Gas (CNG)': 'CNG', 'Liquefied Petroleum Gas (LPG)': 'LPG',
    };
    const transMap: Record<string, string> = {
      'Manual/Standard': 'Ručni', 'Automatic': 'Automatik',
      'Automated Manual Transmission (AMT)': 'Automatik',
      'Continuously Variable Transmission (CVT)': 'CVT',
      'Dual-Clutch Transmission (DCT)': 'DSG',
    };

    const yearStr = map['Model Year'];
    const ccStr = map['Displacement (CC)'];

    const result: VinResult = {
      vin,
      make: map['Make'] ? capitalize(map['Make']) : undefined,
      model: map['Model'] || undefined,
      year: yearStr ? parseInt(yearStr, 10) : undefined,
      engine_cc: ccStr ? Math.round(parseFloat(ccStr)) : undefined,
      fuel: fuelMap[map['Fuel Type - Primary']] || map['Fuel Type - Primary'] || undefined,
      body_type: map['Body Class'] || undefined,
      drivetrain: map['Drive Type'] || undefined,
      transmission: transMap[map['Transmission Style']] || map['Transmission Style'] || undefined,
      doors: map['Doors'] ? parseInt(map['Doors'], 10) : undefined,
      raw: map,
    };
    return result;
  } catch (err: any) {
    return { error: err?.message || 'Network error' };
  }
}

function capitalize(s: string): string {
  return s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
