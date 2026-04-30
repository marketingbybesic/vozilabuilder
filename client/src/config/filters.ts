// client/src/config/filters.ts
// Filter definitions per category — keyed to live DB top-level slugs.
// All filter ids reference keys inside the listings.attributes JSONB column.

export type FilterType = 'select' | 'range' | 'boolean' | 'radio' | 'multiselect';

export interface FilterDefinition {
  id: string;
  label: string;
  type: FilterType;
  options?: { label: string; value: string | number }[];
  unit?: string;
  group?: 'Tehnički podaci' | 'Oprema' | 'Sigurnost' | 'Opće' | 'Vozilo' | 'Plovilo' | 'Stroj';
  placeholder?: string;
}

// Filters that apply to almost every category.
export const globalFilters: FilterDefinition[] = [
  { id: 'price',        label: 'Cijena',     type: 'range', unit: '€', group: 'Opće' },
  { id: 'year',         label: 'Godište',    type: 'range', group: 'Opće' },
  { id: 'condition',    label: 'Stanje',     type: 'radio', group: 'Opće', options: [
    { label: 'Novo',          value: 'Novo' },
    { label: 'Rabljeno',      value: 'Rabljeno' },
    { label: 'Karambolirano', value: 'Karambolirano' },
  ]},
  { id: 'listing_type', label: 'Tip oglasa', type: 'radio', group: 'Opće', options: [
    { label: 'Prodaja', value: 'prodaja' },
    { label: 'Najam',   value: 'najam' },
    { label: 'Zamjena', value: 'zamjena' },
  ]},
];

const FUEL_OPTIONS = [
  { label: 'Benzin',  value: 'Benzin' },
  { label: 'Diesel',  value: 'Diesel' },
  { label: 'Hibrid',  value: 'Hibrid' },
  { label: 'Plug-in hibrid', value: 'PHEV' },
  { label: 'Električni', value: 'EV' },
  { label: 'Plin (LPG)', value: 'LPG' },
  { label: 'Plin (CNG)', value: 'CNG' },
];

const TRANSMISSION_OPTIONS = [
  { label: 'Ručni',     value: 'Ručni' },
  { label: 'Automatik', value: 'Automatik' },
  { label: 'DSG/DCT',   value: 'DSG' },
  { label: 'CVT',       value: 'CVT' },
];

const DRIVETRAIN_OPTIONS = [
  { label: 'Prednji (FWD)',  value: 'FWD' },
  { label: 'Stražnji (RWD)', value: 'RWD' },
  { label: 'Pogon na sve kotače (4x4 / AWD)', value: 'AWD' },
];

const COLOR_OPTIONS = [
  'Crna', 'Bijela', 'Srebrna', 'Siva', 'Plava', 'Crvena',
  'Zelena', 'Žuta', 'Smeđa', 'Bordo', 'Narančasta', 'Bež',
].map((c) => ({ label: c, value: c }));

const EURO_OPTIONS = ['Euro 3', 'Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d'].map((v) => ({ label: v, value: v }));

export const categoryFilters: Record<string, FilterDefinition[]> = {
  // ----------------------------------------------------------------------
  'osobni-automobili': [
    { id: 'mileage',     label: 'Kilometraža',  type: 'range',  unit: 'km',  group: 'Tehnički podaci' },
    { id: 'fuel',        label: 'Gorivo',       type: 'select', group: 'Tehnički podaci', options: FUEL_OPTIONS },
    { id: 'transmission', label: 'Mjenjač',     type: 'select', group: 'Tehnički podaci', options: TRANSMISSION_OPTIONS },
    { id: 'power_hp',    label: 'Snaga',        type: 'range',  unit: 'KS',  group: 'Tehnički podaci' },
    { id: 'engine_cc',   label: 'Radni obujam', type: 'range',  unit: 'ccm', group: 'Tehnički podaci' },
    { id: 'doors',       label: 'Vrata',        type: 'select', group: 'Vozilo', options: [
      { label: '2/3', value: 3 }, { label: '4/5', value: 5 },
    ]},
    { id: 'seats',       label: 'Sjedala',      type: 'range',  group: 'Vozilo' },
    { id: 'body_type',   label: 'Karoserija',   type: 'select', group: 'Vozilo', options: [
      { label: 'Limuzina',  value: 'Limuzina' },
      { label: 'Karavan',   value: 'Karavan' },
      { label: 'Hatchback', value: 'Hatchback' },
      { label: 'SUV',       value: 'SUV' },
      { label: 'Coupe',     value: 'Coupe' },
      { label: 'Cabriolet', value: 'Cabriolet' },
      { label: 'Pickup',    value: 'Pickup' },
      { label: 'Mali (gradski)', value: 'City' },
    ]},
    { id: 'drivetrain',  label: 'Pogon',        type: 'select', group: 'Vozilo', options: DRIVETRAIN_OPTIONS },
    { id: 'color',       label: 'Boja',         type: 'select', group: 'Vozilo', options: COLOR_OPTIONS },
    { id: 'owners',      label: 'Broj vlasnika', type: 'range', group: 'Sigurnost' },
    { id: 'service_history', label: 'Servisna knjiga', type: 'boolean', group: 'Sigurnost' },
    { id: 'first_owner',  label: 'Prvi vlasnik',     type: 'boolean', group: 'Sigurnost' },
    { id: 'registered',   label: 'Registriran',      type: 'boolean', group: 'Sigurnost' },
    { id: 'damage_free',  label: 'Bez oštećenja',    type: 'boolean', group: 'Sigurnost' },
    { id: 'imported_from', label: 'Uvoz iz', type: 'select', group: 'Opće', options: [
      { label: 'Hrvatska',   value: 'HR' },
      { label: 'Njemačka',   value: 'DE' },
      { label: 'Austrija',   value: 'AT' },
      { label: 'Italija',    value: 'IT' },
      { label: 'Slovenija',  value: 'SI' },
      { label: 'Ostalo',     value: 'other' },
    ]},
  ],

  // ----------------------------------------------------------------------
  'motocikli': [
    { id: 'mileage',     label: 'Kilometraža',  type: 'range', unit: 'km',  group: 'Tehnički podaci' },
    { id: 'engine_cc',   label: 'Radni obujam', type: 'range', unit: 'ccm', group: 'Tehnički podaci' },
    { id: 'power_hp',    label: 'Snaga',        type: 'range', unit: 'KS',  group: 'Tehnički podaci' },
    { id: 'moto_type',   label: 'Tip motocikla', type: 'select', group: 'Vozilo', options: [
      { label: 'Sportski',     value: 'sportski' },
      { label: 'Naked',        value: 'naked' },
      { label: 'Touring',      value: 'touring' },
      { label: 'Cruiser',      value: 'cruiser' },
      { label: 'Chopper',      value: 'chopper' },
      { label: 'Cross/Enduro', value: 'cross-enduro' },
      { label: 'Supermoto',    value: 'supermoto' },
      { label: 'Skuter',       value: 'skuter' },
      { label: 'ATV / Quad',   value: 'atv' },
      { label: 'Električni',   value: 'e-moto' },
    ]},
    { id: 'transmission', label: 'Mjenjač', type: 'select', group: 'Tehnički podaci', options: [
      { label: 'Ručni',     value: 'Ručni' },
      { label: 'Automatski', value: 'Automatik' },
      { label: 'Polu-automatski', value: 'Polu-auto' },
    ]},
    { id: 'license', label: 'Vozačka kategorija', type: 'select', group: 'Sigurnost', options: [
      { label: 'AM',  value: 'AM' }, { label: 'A1', value: 'A1' },
      { label: 'A2',  value: 'A2' }, { label: 'A',  value: 'A' },
    ]},
    { id: 'abs',          label: 'ABS', type: 'boolean', group: 'Sigurnost' },
    { id: 'registered',   label: 'Registriran', type: 'boolean', group: 'Sigurnost' },
  ],

  // ----------------------------------------------------------------------
  'bicikli-romobili': [
    { id: 'bike_type', label: 'Vrsta', type: 'select', group: 'Vozilo', options: [
      { label: 'Cestovni bicikl',  value: 'cestovni' },
      { label: 'MTB (brdski)',     value: 'mtb' },
      { label: 'Gravel',           value: 'gravel' },
      { label: 'Treking',          value: 'treking' },
      { label: 'Gradski',          value: 'gradski' },
      { label: 'Dječji',           value: 'dijecji' },
      { label: 'E-bicikl',         value: 'e-bike' },
      { label: 'E-romobil',        value: 'e-scooter' },
      { label: 'E-skejt',          value: 'e-skate' },
    ]},
    { id: 'frame_size', label: 'Veličina okvira', type: 'select', group: 'Tehnički podaci', options: [
      { label: 'XS (47-50cm)', value: 'XS' }, { label: 'S (50-53cm)',  value: 'S' },
      { label: 'M (53-56cm)',  value: 'M' },  { label: 'L (56-59cm)',  value: 'L' },
      { label: 'XL (59cm+)',   value: 'XL' },
    ]},
    { id: 'frame_material', label: 'Materijal', type: 'select', group: 'Tehnički podaci', options: [
      { label: 'Aluminij', value: 'Aluminij' }, { label: 'Karbon', value: 'Karbon' },
      { label: 'Čelik',    value: 'Čelik' },    { label: 'Titan',  value: 'Titan' },
    ]},
    { id: 'wheel_size', label: 'Veličina kotača', type: 'select', group: 'Tehnički podaci', options: [
      { label: '26"', value: 26 }, { label: '27.5"', value: 27.5 },
      { label: '28"', value: 28 }, { label: '29"',   value: 29 },
    ]},
    { id: 'gears', label: 'Brzine', type: 'range', group: 'Tehnički podaci' },
    { id: 'battery_wh', label: 'Baterija (e-bike)', type: 'range', unit: 'Wh', group: 'Tehnički podaci' },
    { id: 'range_km',   label: 'Domet (e-bike/scooter)', type: 'range', unit: 'km', group: 'Tehnički podaci' },
  ],

  // ----------------------------------------------------------------------
  'kombiji-laki-teretni': [
    { id: 'mileage',      label: 'Kilometraža',  type: 'range', unit: 'km', group: 'Tehnički podaci' },
    { id: 'fuel',         label: 'Gorivo',       type: 'select', group: 'Tehnički podaci', options: FUEL_OPTIONS },
    { id: 'transmission', label: 'Mjenjač',      type: 'select', group: 'Tehnički podaci', options: TRANSMISSION_OPTIONS },
    { id: 'power_hp',     label: 'Snaga',        type: 'range', unit: 'KS', group: 'Tehnički podaci' },
    { id: 'payload_kg',   label: 'Nosivost',     type: 'range', unit: 'kg', group: 'Vozilo' },
    { id: 'cargo_volume', label: 'Volumen tovarnog prostora', type: 'range', unit: 'm³', group: 'Vozilo' },
    { id: 'roof_height',  label: 'Visina krova', type: 'select', group: 'Vozilo', options: [
      { label: 'L1 (kratki)',  value: 'L1' }, { label: 'L2 (srednji)', value: 'L2' },
      { label: 'L3 (dugi)',    value: 'L3' }, { label: 'L4 (extra dugi)', value: 'L4' },
    ]},
    { id: 'seats',     label: 'Sjedala',     type: 'range',   group: 'Vozilo' },
    { id: 'body_type', label: 'Tip kombija', type: 'select',  group: 'Vozilo', options: [
      { label: 'Putnički kombi',  value: 'putnicki' },
      { label: 'Dostavna',        value: 'dostavna' },
      { label: 'Kombi-furgon',    value: 'furgon' },
      { label: 'Hladnjača',       value: 'hladnjaca' },
      { label: 'Izoterm',         value: 'izoterm' },
      { label: 'Kiper laki',      value: 'kiper-laki' },
    ]},
    { id: 'euro',         label: 'Euro norma',     type: 'select',  group: 'Tehnički podaci', options: EURO_OPTIONS },
    { id: 'registered',   label: 'Registriran',    type: 'boolean', group: 'Sigurnost' },
  ],

  // ----------------------------------------------------------------------
  'kamioni-teretna': [
    { id: 'mileage',      label: 'Kilometraža',  type: 'range', unit: 'km', group: 'Tehnički podaci' },
    { id: 'power_hp',     label: 'Snaga',        type: 'range', unit: 'KS', group: 'Tehnički podaci' },
    { id: 'axles',        label: 'Broj osovina', type: 'select', group: 'Vozilo', options: [
      { label: '2', value: 2 }, { label: '3', value: 3 },
      { label: '4', value: 4 }, { label: '5+', value: 5 },
    ]},
    { id: 'gross_weight', label: 'Bruto masa',   type: 'range', unit: 'kg', group: 'Vozilo' },
    { id: 'payload_kg',   label: 'Nosivost',     type: 'range', unit: 'kg', group: 'Vozilo' },
    { id: 'truck_type',   label: 'Tip kamiona',  type: 'select', group: 'Vozilo', options: [
      { label: 'Vučni (sedlasti)', value: 'sedlasti' },
      { label: 'Kiper',            value: 'kiper' },
      { label: 'Hladnjača',        value: 'hladnjaca' },
      { label: 'Autocisterna',     value: 'autocisterna' },
      { label: 'Drvarski / šumarski', value: 'drvarski' },
      { label: 'Šleper',           value: 'sleper' },
      { label: 'Prikolica',        value: 'prikolica' },
      { label: 'Autobus',          value: 'autobus' },
    ]},
    { id: 'transmission', label: 'Mjenjač',      type: 'select',  group: 'Tehnički podaci', options: [
      { label: 'Ručni',     value: 'Ručni' },
      { label: 'Automatski', value: 'Automatik' },
    ]},
    { id: 'euro',         label: 'Euro norma',   type: 'select',  group: 'Tehnički podaci', options: EURO_OPTIONS },
    { id: 'sleeping_cabin', label: 'Spavaća kabina', type: 'boolean', group: 'Vozilo' },
    { id: 'registered',     label: 'Registriran',    type: 'boolean', group: 'Sigurnost' },
  ],

  // ----------------------------------------------------------------------
  'strojevi': [
    { id: 'operating_hours', label: 'Radni sati', type: 'range', unit: 'h',  group: 'Stroj' },
    { id: 'weight_kg',       label: 'Težina',     type: 'range', unit: 'kg', group: 'Stroj' },
    { id: 'power_hp',        label: 'Snaga',      type: 'range', unit: 'KS', group: 'Stroj' },
    { id: 'machine_type',    label: 'Vrsta stroja', type: 'select', group: 'Stroj', options: [
      { label: 'Traktor',     value: 'traktor' },
      { label: 'Kombajn',     value: 'kombajn' },
      { label: 'Bager',       value: 'bager' },
      { label: 'Utovarivač',  value: 'utovarivac' },
      { label: 'Viličar',     value: 'vilicar' },
      { label: 'Dizalica',    value: 'dizalica' },
      { label: 'Valjak',      value: 'valjak' },
      { label: 'Damper',      value: 'damper' },
      { label: 'Generator',   value: 'generator' },
      { label: 'Mikser/Pumpa', value: 'mikser' },
      { label: 'Ostalo',      value: 'ostalo' },
    ]},
    { id: 'drive_type',  label: 'Vrsta pogona', type: 'radio', group: 'Stroj', options: [
      { label: 'Gusjeničar', value: 'Gusjeničar' },
      { label: 'Kotači',     value: 'Kotači' },
      { label: 'Kombinirani', value: 'Kombi' },
    ]},
    { id: 'attachments', label: 'Dolazi s priključcima', type: 'boolean', group: 'Stroj' },
    { id: 'cab_climate', label: 'Klima u kabini',         type: 'boolean', group: 'Stroj' },
  ],

  // ----------------------------------------------------------------------
  'kamperi-karavani': [
    { id: 'mileage',     label: 'Kilometraža', type: 'range', unit: 'km', group: 'Tehnički podaci' },
    { id: 'length_m',    label: 'Dužina',      type: 'range', unit: 'm',  group: 'Vozilo' },
    { id: 'beds',        label: 'Broj ležajeva', type: 'range', group: 'Vozilo' },
    { id: 'camper_type', label: 'Tip kampera',  type: 'select', group: 'Vozilo', options: [
      { label: 'Poluintegralni', value: 'poluintegralni' },
      { label: 'Integralni',     value: 'integralni' },
      { label: 'Alkoven',        value: 'alkoven' },
      { label: 'Camper van',     value: 'van' },
      { label: 'Kamp-prikolica', value: 'prikolica' },
      { label: 'Mali kamper',    value: 'mali' },
    ]},
    { id: 'fuel',         label: 'Gorivo',       type: 'select', group: 'Tehnički podaci', options: FUEL_OPTIONS },
    { id: 'transmission', label: 'Mjenjač',      type: 'select', group: 'Tehnički podaci', options: TRANSMISSION_OPTIONS },
    { id: 'kitchen',      label: 'Kuhinja',      type: 'boolean', group: 'Oprema' },
    { id: 'bathroom',     label: 'Kupaonica',    type: 'boolean', group: 'Oprema' },
    { id: 'solar',        label: 'Solarni paneli', type: 'boolean', group: 'Oprema' },
    { id: 'awning',       label: 'Tenda',        type: 'boolean', group: 'Oprema' },
    { id: 'satellite',    label: 'Satelit',      type: 'boolean', group: 'Oprema' },
  ],

  // ----------------------------------------------------------------------
  'plovila-nautika': [
    { id: 'boat_type', label: 'Tip plovila', type: 'select', group: 'Plovilo', options: [
      { label: 'Gliser',          value: 'gliser' },
      { label: 'Jedrilica',       value: 'jedrilica' },
      { label: 'Gumenjak',        value: 'gumenjak' },
      { label: 'Jahta',           value: 'jahta' },
      { label: 'Ribarski čamac',  value: 'ribarski' },
      { label: 'Kayak / kanu',    value: 'kayak' },
      { label: 'Jet ski',         value: 'jet-ski' },
    ]},
    { id: 'length_m',     label: 'Dužina',         type: 'range', unit: 'm', group: 'Plovilo' },
    { id: 'engine_hp',    label: 'Snaga motora',   type: 'range', unit: 'KS', group: 'Plovilo' },
    { id: 'engines',      label: 'Broj motora',    type: 'range', group: 'Plovilo' },
    { id: 'engine_type',  label: 'Tip motora',     type: 'select', group: 'Plovilo', options: [
      { label: 'Vanbrodski',     value: 'vanbrodski' },
      { label: 'Unutarnji',      value: 'unutarnji' },
      { label: 'Z-pogon',        value: 'z-pogon' },
      { label: 'Bez motora',     value: 'bez' },
    ]},
    { id: 'engine_hours', label: 'Radni sati motora', type: 'range', unit: 'h', group: 'Plovilo' },
    { id: 'beds',         label: 'Ležajevi',          type: 'range', group: 'Plovilo' },
    { id: 'material',     label: 'Materijal',         type: 'select', group: 'Plovilo', options: [
      { label: 'Polietilen / PVC', value: 'pvc' },
      { label: 'Aluminij',         value: 'aluminij' },
      { label: 'Drvo',             value: 'drvo' },
      { label: 'Fiberglass / GRP', value: 'grp' },
      { label: 'Karbon',           value: 'karbon' },
    ]},
    { id: 'registered',   label: 'Registrirano', type: 'boolean', group: 'Sigurnost' },
    { id: 'gps',          label: 'GPS / Plotter', type: 'boolean', group: 'Oprema' },
    { id: 'autopilot',    label: 'Autopilot',     type: 'boolean', group: 'Oprema' },
  ],

  // ----------------------------------------------------------------------
  'dijelovi-oprema': [
    { id: 'part_type', label: 'Vrsta dijela', type: 'select', group: 'Vozilo', options: [
      { label: 'Motor i dijelovi motora', value: 'motor' },
      { label: 'Gume i felge',            value: 'gume-felge' },
      { label: 'Karoserija',              value: 'karoserija' },
      { label: 'Elektrika',               value: 'elektrika' },
      { label: 'Audio i multimedija',     value: 'audio' },
      { label: 'Alat i dijagnostika',     value: 'alat' },
      { label: 'Moto oprema',             value: 'moto-oprema' },
      { label: 'Dijelovi za kamione',     value: 'kamion' },
      { label: 'Dijelovi za traktore',    value: 'traktor' },
      { label: 'Oldtimer dijelovi',       value: 'oldtimer' },
      { label: 'Kemija i tekućine',       value: 'kemija' },
    ]},
    { id: 'compatible_make',  label: 'Marka vozila',  type: 'select', group: 'Vozilo' },
    { id: 'compatible_model', label: 'Model vozila',  type: 'select', group: 'Vozilo' },
    { id: 'compatible_years', label: 'Godina kompatibilnosti', type: 'range', group: 'Vozilo' },
    { id: 'oem_number',       label: 'OEM broj',      type: 'select', group: 'Tehnički podaci' },
    { id: 'warranty',         label: 'Garancija',     type: 'boolean', group: 'Sigurnost' },
  ],

  // ----------------------------------------------------------------------
  'usluge': [
    { id: 'service_type', label: 'Vrsta usluge', type: 'select', group: 'Opće', options: [
      { label: 'Servis i popravak',   value: 'servis' },
      { label: 'Vulkanizer',          value: 'vulkanizer' },
      { label: 'Autopraonica',        value: 'autopraonica' },
      { label: 'Autoškola',           value: 'autoskola' },
      { label: 'Transport vozila',    value: 'transport' },
      { label: 'Dijagnostika',        value: 'dijagnostika' },
      { label: 'Autoelektrika',       value: 'autoelektrika' },
      { label: 'Autolimari',          value: 'autolimari' },
      { label: 'Najam vozila',        value: 'najam' },
      { label: 'Charter',             value: 'charter' },
      { label: 'Ostalo',              value: 'ostalo' },
    ]},
    { id: 'coverage',    label: 'Područje',     type: 'select', group: 'Opće' },
    { id: 'mobile',      label: 'Dolazak na lokaciju', type: 'boolean', group: 'Opće' },
    { id: 'available_24', label: '24/7',        type: 'boolean', group: 'Opće' },
  ],
};
