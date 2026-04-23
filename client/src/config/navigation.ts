import { 
  Car, 
  Bike, 
  Truck, 
  Wrench, 
  Anchor, 
  Tractor,
  LucideIcon 
} from 'lucide-react';

// ============================================================================
// Navigation Configuration
// Rule: slugs = English (for DB queries), labels = Croatian (for UI)
// ============================================================================

export interface NavigationCategory {
  id: string;
  slug: string;        // English - for API/DB queries
  label: string;       // Croatian - for UI display
  icon: LucideIcon;
  description?: string;
}

export const navigationCategories: NavigationCategory[] = [
  {
    id: '1',
    slug: 'cars',
    label: 'Osobni automobili',
    icon: Car,
    description: 'Automobili i osobna vozila'
  },
  {
    id: '2',
    slug: 'motorcycles',
    label: 'Motocikli',
    icon: Bike,
    description: 'Motocikli i skuteri'
  },
  {
    id: '3',
    slug: 'trucks',
    label: 'Gospodarska vozila',
    icon: Truck,
    description: 'Kamioni i dostavna vozila'
  },
  {
    id: '4',
    slug: 'parts',
    label: 'Auto dijelovi',
    icon: Wrench,
    description: 'Dijelovi i oprema'
  },
  {
    id: '5',
    slug: 'boats',
    label: 'Brodovi',
    icon: Anchor,
    description: 'Brodovi i plovila'
  },
  {
    id: '6',
    slug: 'machinery',
    label: 'Strojevi',
    icon: Tractor,
    description: 'Građevinski i poljoprivredni strojevi'
  }
];

// ============================================================================
// Footer Navigation
// ============================================================================

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export const footerSections: FooterSection[] = [
  {
    title: 'Kategorije',
    links: navigationCategories.map(cat => ({
      label: cat.label,
      href: `/?category=${cat.slug}`
    }))
  },
  {
    title: 'Za trgovce',
    links: [
      { label: 'Postani trgovac', href: '/dealer/register' },
      { label: 'Prednosti', href: '/dealer/benefits' },
      { label: 'Cjenik', href: '/dealer/pricing' }
    ]
  },
  {
    title: 'Pravno',
    links: [
      { label: 'Uvjeti korištenja', href: '/terms' },
      { label: 'Politika privatnosti', href: '/privacy' },
      { label: 'Kontakt', href: '/contact' }
    ]
  },
  {
    title: 'O nama',
    links: [
      { label: 'O Vozila.hr', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Pomoć', href: '/help' }
    ]
  }
];
