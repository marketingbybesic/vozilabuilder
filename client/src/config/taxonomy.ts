import {
  Car, Bike, Truck, Tractor, Tent, Wrench, CarFront, Sparkles, History,
  Leaf, Key, Zap, Anchor, Settings2, ShieldCheck, Box, Compass,
  Mountain, Snowflake, Crown, Briefcase, Flame, Gauge, Wind,
  Hammer, ConstructionIcon, Factory, Wheat, Trees, Fuel, Cog,
  Battery, Palette, Volume2, Stethoscope, Sailboat, LifeBuoy,
  PaintBucket, Droplet, Waves, ParkingCircle, Caravan, Footprints,
  GraduationCap, ShowerHead, Rocket, Sprout, ShieldAlert,
  PlugZap, Waypoints
} from 'lucide-react';

export interface NavigationSubItem { name: string; slug: string; icon: any; }
export interface NavigationMenuItem { slug: string; name: string; icon: any; sub: NavigationSubItem[]; }

// Top-level slugs MUST match the live `categories.slug` values in Supabase
// so ListingFeed's `categories!inner(slug)` filter resolves to real rows.
// Subcategory slugs are filter hints stored on `listings.subcategory_slug`
// and are read by ListingFeed via the `?sub=` URL param.
export const navigationMenu: NavigationMenuItem[] = [
  {
    slug: 'osobni-automobili', name: 'Automobili', icon: Car,
    sub: [
      { name: 'Rabljeni automobili', slug: 'rabljeni', icon: CarFront },
      { name: 'Novi automobili', slug: 'novi', icon: Sparkles },
      { name: 'Oldtimeri', slug: 'oldtimeri', icon: History },
      { name: 'EV i Hibridi', slug: 'ev-hibrid', icon: Leaf },
      { name: 'Karambolirana', slug: 'karambolirana', icon: Wrench },
      { name: 'SUV i Terenci', slug: 'suv-terenac', icon: Mountain },
      { name: 'Sportski', slug: 'sportski', icon: Gauge },
      { name: 'Limuzine', slug: 'limuzine', icon: Crown },
      { name: 'Karavani', slug: 'karavani', icon: Briefcase },
      { name: 'Hatchback', slug: 'hatchback', icon: Car },
      { name: 'Mali / gradski', slug: 'mali-gradski', icon: ParkingCircle },
      { name: 'Osobni kombiji', slug: 'kombi-osobni', icon: Caravan }
    ]
  },
  {
    slug: 'motocikli-atv', name: 'Motocikli i ATV', icon: Bike,
    sub: [
      { name: 'Motocikli', slug: 'motocikli', icon: Bike },
      { name: 'Skuteri i mopedi', slug: 'skuteri', icon: Zap },
      { name: 'ATV / Quad', slug: 'atv-quad', icon: Box },
      { name: 'Cross / Enduro', slug: 'cross-enduro', icon: Mountain },
      { name: 'Chopper / Cruiser', slug: 'chopper-cruiser', icon: Flame },
      { name: 'Supermoto', slug: 'supermoto', icon: Gauge },
      { name: 'Sportski', slug: 'sportski-moto', icon: Rocket },
      { name: 'Naked', slug: 'naked', icon: Wind },
      { name: 'Touring', slug: 'touring', icon: Compass },
      { name: 'Moto oldtimeri', slug: 'oldtimeri-moto', icon: History }
    ]
  },
  {
    slug: 'gospodarska-vozila', name: 'Gospodarska vozila', icon: Truck,
    sub: [
      { name: 'Dostavna vozila', slug: 'dostavna', icon: Box },
      { name: 'Putnički kombiji', slug: 'putnicki-kombi', icon: Caravan },
      { name: 'Vučni kamioni', slug: 'kamioni-vlacni', icon: Truck },
      { name: 'Kiperi', slug: 'kiper', icon: Truck },
      { name: 'Hladnjače', slug: 'hladnjace', icon: Snowflake },
      { name: 'Autocisterne', slug: 'autocisterne', icon: Fuel },
      { name: 'Drvarske / šumarske', slug: 'drvarske', icon: Trees },
      { name: 'Šleperi', slug: 'sleperi', icon: Truck },
      { name: 'Prikolice i poluprikolice', slug: 'prikolice-poluprikolice', icon: Settings2 },
      { name: 'Autobusi', slug: 'autobusi', icon: CarFront },
      { name: 'Izoterm', slug: 'izoterm', icon: ShieldCheck }
    ]
  },
  {
    slug: 'strojevi-alati', name: 'Strojevi i alati', icon: Tractor,
    sub: [
      { name: 'Traktori', slug: 'traktori', icon: Tractor },
      { name: 'Kombajni', slug: 'kombajni', icon: Wheat },
      { name: 'Bageri', slug: 'bageri', icon: ConstructionIcon },
      { name: 'Utovarivači', slug: 'utovarivaci', icon: Box },
      { name: 'Viličari', slug: 'viljuskari', icon: Box },
      { name: 'Dizalice', slug: 'dizalice', icon: Factory },
      { name: 'Priključni strojevi', slug: 'prikljucni-strojevi', icon: Settings2 },
      { name: 'Mikseri i pumpe', slug: 'miksere-pumpe', icon: PaintBucket },
      { name: 'Generatori', slug: 'generatori', icon: PlugZap },
      { name: 'Damperi', slug: 'dumperi', icon: Truck },
      { name: 'Vinogradarski', slug: 'vinogradarski', icon: Trees },
      { name: 'Ostali strojevi', slug: 'ostali-strojevi', icon: Hammer }
    ]
  },
  {
    slug: 'kamperi', name: 'Kamperi i karavani', icon: Tent,
    sub: [
      { name: 'Poluintegralni', slug: 'kamperi-poluintegralni', icon: Caravan },
      { name: 'Integralni', slug: 'kamperi-integralni', icon: Caravan },
      { name: 'Alkoven', slug: 'alkoven', icon: Tent },
      { name: 'Vanovi (camper van)', slug: 'vanovi', icon: Caravan },
      { name: 'Kamp-prikolice', slug: 'prikolice-kamp', icon: Settings2 },
      { name: 'Mali kamperi', slug: 'mali-kamperi', icon: Tent }
    ]
  },
  {
    slug: 'nautika', name: 'Nautika', icon: Anchor,
    sub: [
      { name: 'Gliseri', slug: 'gliseri', icon: Sailboat },
      { name: 'Jedrilice', slug: 'jedrilice', icon: Sailboat },
      { name: 'Gumenjaci', slug: 'gumenjaci', icon: LifeBuoy },
      { name: 'Jahte', slug: 'jahte', icon: Anchor },
      { name: 'Ribarski čamci', slug: 'ribarske-camce', icon: Anchor },
      { name: 'Kajak / kanu', slug: 'kayak-kanu', icon: Waves },
      { name: 'Plovni motori', slug: 'plovni-motori', icon: Cog },
      { name: 'Prikolice za plovila', slug: 'prikolice-plovila', icon: Settings2 },
      { name: 'Jet-skije', slug: 'jet-skije', icon: Waves }
    ]
  },
  {
    slug: 'e-mobilnost', name: 'E-mobilnost', icon: PlugZap,
    sub: [
      { name: 'Cestovni bicikli', slug: 'cestovni', icon: Bike },
      { name: 'MTB (brdski)', slug: 'mtb', icon: Mountain },
      { name: 'Gravel', slug: 'gravel', icon: Waypoints },
      { name: 'Treking', slug: 'treking', icon: Compass },
      { name: 'Gradski bicikli', slug: 'gradski', icon: ParkingCircle },
      { name: 'Dječji bicikli', slug: 'dijecji', icon: Footprints },
      { name: 'E-bicikli', slug: 'e-bicikli', icon: Zap },
      { name: 'E-romobili', slug: 'e-romobili', icon: PlugZap },
      { name: 'E-skejt', slug: 'e-skejt', icon: Rocket },
      { name: 'Električni motocikli', slug: 'e-moto', icon: PlugZap }
    ]
  },
  {
    slug: 'dijelovi-oprema', name: 'Dijelovi i oprema', icon: Wrench,
    sub: [
      { name: 'Rezervni dijelovi', slug: 'rezervni-dijelovi', icon: Settings2 },
      { name: 'Auto-dijelovi i motor', slug: 'auto-dijelovi-motor', icon: Settings2 },
      { name: 'Gume i felge', slug: 'gume-felge', icon: Box },
      { name: 'Karoserija', slug: 'karoserija', icon: PaintBucket },
      { name: 'Elektrika', slug: 'elektrika', icon: Battery },
      { name: 'Audio i multimedija', slug: 'audio-multimedia', icon: Volume2 },
      { name: 'Alat i dijagnostika', slug: 'alat-dijagnostika', icon: Stethoscope },
      { name: 'Moto oprema', slug: 'moto-oprema', icon: ShieldCheck },
      { name: 'Dijelovi za kamione', slug: 'kamion-dijelovi', icon: Truck },
      { name: 'Dijelovi za traktore', slug: 'traktor-dijelovi', icon: Tractor },
      { name: 'Oldtimer dijelovi', slug: 'oldtimer-dijelovi', icon: History },
      { name: 'Kemija i tekućine', slug: 'kemija-tekucine', icon: Droplet }
    ]
  },
  {
    slug: 'najam-charter', name: 'Najam i charter', icon: Key,
    sub: [
      { name: 'Najam automobila', slug: 'najam-auto', icon: Key },
      { name: 'Najam kombija', slug: 'najam-kombi', icon: Key },
      { name: 'Najam kamiona', slug: 'najam-kamion', icon: Key },
      { name: 'Najam motocikla', slug: 'najam-moto', icon: Key },
      { name: 'Najam bicikla', slug: 'najam-bicikli', icon: Key },
      { name: 'Najam kampera', slug: 'najam-kamp', icon: Key },
      { name: 'Najam plovila', slug: 'najam-plovila', icon: Key },
      { name: 'Najam strojeva', slug: 'najam-strojeva', icon: Key },
      { name: 'Charter (yacht)', slug: 'charter-yacht', icon: Sailboat }
    ]
  },
  {
    slug: 'usluge', name: 'Auto-moto usluge', icon: Wrench,
    sub: [
      { name: 'Servis i popravak', slug: 'servis-popravak', icon: Wrench },
      { name: 'Autosalon i najam', slug: 'autosalon-najam', icon: Key },
      { name: 'Vulkanizer', slug: 'vulkanizer', icon: Box },
      { name: 'Autopraonice', slug: 'autopraonice', icon: ShowerHead },
      { name: 'Autoškole', slug: 'autoskole', icon: GraduationCap },
      { name: 'Transport vozila', slug: 'transport-vozila', icon: Truck },
      { name: 'Dijagnostika', slug: 'dijagnostika', icon: Stethoscope },
      { name: 'Autoelektrika', slug: 'autoelektrika', icon: Battery },
      { name: 'Autolimari', slug: 'autolimari', icon: Hammer },
      { name: 'Ostale usluge', slug: 'ostalo-usluge', icon: Palette }
    ]
  }
];
