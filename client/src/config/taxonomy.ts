import { Car, Bike, Truck, Anchor, Wrench, Key, Package, LucideIcon } from 'lucide-react';

export interface NavigationMenuItem {
  slug: string;
  name: string;
  sub: string[];
  icon?: LucideIcon;
}

export const navigationMenu: NavigationMenuItem[] = [
  { 
    slug: 'osobni-automobili', 
    name: 'Osobni automobili', 
    sub: ['Limuzine', 'Karavani', 'SUV/Terenac', 'Coupe', 'Cabriolet', 'Oldtimeri'],
    icon: Car
  },
  { 
    slug: 'motocikli-atv', 
    name: 'Motocikli i ATV', 
    sub: ['Motocikli', 'Skuteri', 'Četverocikli', 'Motorne sanjke'],
    icon: Bike
  },
  { 
    slug: 'gospodarska-vozila', 
    name: 'Gospodarska', 
    sub: ['Kombi vozila', 'Kamioni', 'Tegljači', 'Prikolice'],
    icon: Truck
  },
  { 
    slug: 'nautika', 
    name: 'Nautika', 
    sub: ['Motorni brodovi', 'Jedrilice', 'Gumenjaci'],
    icon: Anchor
  },
  { 
    slug: 'dijelovi-oprema', 
    name: 'Dijelovi', 
    sub: ['Gume i felge', 'Rezervni dijelovi', 'Autoakustika', 'Moto oprema'],
    icon: Wrench
  },
  { 
    slug: 'najam-charter', 
    name: 'Najam', 
    sub: ['Rent-a-car', 'Najam kombija', 'Najam kampera'],
    icon: Key
  },
  { 
    slug: 'ostalo', 
    name: 'Ostalo', 
    sub: ['Kamperi', 'Strojevi i alati', 'E-mobilnost', 'Auto-moto usluge'],
    icon: Package
  }
];
