export interface FixerBusiness {
  id: string;
  name: string;
  category: BusinessCategory;
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  rating: number;
  reviews: number;
  description: string;
  googleMapsUrl: string;
  logoUrl?: string;
  images: string[];
  isPremium: boolean;
  hours?: string;
  services?: string[];
}

export const FIXER_CATEGORIES = [
  'All',
  'Home',
  'Plumbing',
  'Electronics',
  'Car',
  'Appliances',
  'HVAC',
] as const;

export type FixerCategory = (typeof FIXER_CATEGORIES)[number];
export type BusinessCategory = Exclude<FixerCategory, 'All'>;
export type BusinessApplicationStatus = 'pending' | 'verified' | 'rejected';

export interface BusinessApplication {
  id: string;
  name: string;
  category: BusinessCategory;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  description: string;
  googleMapsUrl: string;
  submittedAt: string;
  status: BusinessApplicationStatus;
  lat: number;
  lng: number;
  logoUrl?: string;
  imageUrl?: string;
}

type SubmittedFixerInput = {
  name: string;
  category: BusinessCategory;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  description: string;
  logoUrl?: string;
  imageUrl?: string;
  googleMapsUrl?: string;
  lat?: number;
  lng?: number;
};

const DEFAULT_LAT = 14.5995;
const DEFAULT_LNG = 120.9842;
const DEFAULT_SUBMITTED_AT = '2026-04-23T08:00:00Z';

const seedFixers: FixerBusiness[] = [
  {
    id: 'f1',
    name: 'Manila Pipe Masters',
    category: 'Plumbing',
    lat: 14.5995,
    lng: 120.9842,
    address: '123 Mabini St, Ermita',
    city: 'Manila',
    country: 'Philippines',
    phone: '+63 912 345 6789',
    email: 'contact@manilapipe.ph',
    rating: 4.8,
    reviews: 124,
    description:
      'Expert plumbing repairs, leak detection, pipe installation, and bathroom renovations. 24/7 emergency service available.',
    googleMapsUrl: buildGoogleMapsUrl(14.5995, 120.9842),
    images: [
      'https://picsum.photos/seed/plumbing1/400/300',
      'https://picsum.photos/seed/plumbing2/400/300',
    ],
    isPremium: true,
    hours: 'Mon-Sat 08:00-20:00',
    services: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning', 'Water Heater Repair'],
  },
  {
    id: 'f2',
    name: 'Nairobi Cool Air',
    category: 'HVAC',
    lat: -1.286389,
    lng: 36.817223,
    address: '45 Ngong Rd, Kilimani',
    city: 'Nairobi',
    country: 'Kenya',
    phone: '+254 712 345 678',
    email: 'info@nairobicool.co.ke',
    rating: 4.6,
    reviews: 89,
    description:
      'Air conditioner installation, repair, and maintenance. Servicing residential and commercial units across Nairobi.',
    googleMapsUrl: buildGoogleMapsUrl(-1.286389, 36.817223),
    images: [
      'https://picsum.photos/seed/hvac1/400/300',
      'https://picsum.photos/seed/hvac2/400/300',
    ],
    isPremium: false,
    hours: 'Mon-Fri 8AM-6PM',
    services: ['AC install', 'AC repair', 'Filter cleaning', 'Ductwork'],
  },
  {
    id: 'f3',
    name: 'Bangalore Home Fix',
    category: 'Home',
    lat: 12.9716,
    lng: 77.5946,
    address: '88 Koramangala 5th Block',
    city: 'Bangalore',
    country: 'India',
    phone: '+91 98765 43210',
    email: 'hello@bangalorehomefix.in',
    rating: 4.9,
    reviews: 312,
    description:
      'Complete home repair service - carpentry, painting, drywall, doors, windows, and general maintenance.',
    googleMapsUrl: buildGoogleMapsUrl(12.9716, 77.5946),
    images: [
      'https://picsum.photos/seed/homefix1/400/300',
      'https://picsum.photos/seed/homefix2/400/300',
    ],
    isPremium: true,
    hours: 'Daily 8AM-9PM',
    services: ['Carpentry', 'Painting', 'Drywall repair', 'Door/Window fix'],
  },
  {
    id: 'f4',
    name: 'London Tech Repair',
    category: 'Electronics',
    lat: 51.5074,
    lng: -0.1278,
    address: '221B Baker Street',
    city: 'London',
    country: 'UK',
    phone: '+44 20 7946 0958',
    email: 'repair@londontech.uk',
    rating: 4.7,
    reviews: 210,
    description:
      'Phone, laptop, and gadget repairs. Screen replacement, battery swap, water damage recovery, and data recovery.',
    googleMapsUrl: buildGoogleMapsUrl(51.5074, -0.1278),
    images: [
      'https://picsum.photos/seed/tech1/400/300',
      'https://picsum.photos/seed/tech2/400/300',
    ],
    isPremium: true,
    hours: 'Mon-Sat 9AM-7PM',
    services: ['Screen repair', 'Battery replacement', 'Water damage', 'Data recovery'],
  },
  {
    id: 'f5',
    name: 'Austin Auto Care',
    category: 'Car',
    lat: 30.2672,
    lng: -97.7431,
    address: '600 W 6th St',
    city: 'Austin',
    country: 'USA',
    phone: '+1 512 555 0199',
    email: 'service@austinautocare.com',
    rating: 4.5,
    reviews: 156,
    description:
      'Full-service auto repair - brakes, oil changes, diagnostics, tire rotation, and engine tune-ups.',
    googleMapsUrl: buildGoogleMapsUrl(30.2672, -97.7431),
    images: ['https://picsum.photos/seed/car1/400/300'],
    isPremium: false,
    hours: 'Mon-Sat 7AM-6PM',
    services: ['Brake repair', 'Oil change', 'Diagnostics', 'Tire service'],
  },
  {
    id: 'f6',
    name: 'Cebu Appliance Doc',
    category: 'Appliances',
    lat: 10.3157,
    lng: 123.8854,
    address: '22 Osmena Blvd',
    city: 'Cebu City',
    country: 'Philippines',
    phone: '+63 917 555 4433',
    email: 'fix@cebuappliance.ph',
    rating: 4.4,
    reviews: 67,
    description:
      'Washing machine, refrigerator, microwave, and aircon repair. Genuine parts and warranty on all repairs.',
    googleMapsUrl: buildGoogleMapsUrl(10.3157, 123.8854),
    images: ['https://picsum.photos/seed/appliance1/400/300'],
    isPremium: false,
    hours: 'Mon-Sat 8AM-5PM',
    services: ['Washer repair', 'Fridge repair', 'Microwave fix', 'AC repair'],
  },
  {
    id: 'f7',
    name: 'Dubai Elite Plumbing',
    category: 'Plumbing',
    lat: 25.2048,
    lng: 55.2708,
    address: 'Al Karama, Street 12A',
    city: 'Dubai',
    country: 'UAE',
    phone: '+971 50 123 4567',
    email: 'elite@dubaiplumbing.ae',
    rating: 4.9,
    reviews: 245,
    description:
      'Premium plumbing and sanitary solutions for villas, apartments, and commercial buildings in Dubai.',
    googleMapsUrl: buildGoogleMapsUrl(25.2048, 55.2708),
    images: [],
    isPremium: true,
    hours: 'Daily 6AM-11PM',
    services: ['Leak repair', 'Bathroom renovation', 'Water tank cleaning', 'Sewer line'],
  },
  {
    id: 'f8',
    name: 'Tokyo Circuit Fix',
    category: 'Electronics',
    lat: 35.6762,
    lng: 139.6503,
    address: '3-15-6 Shibuya',
    city: 'Tokyo',
    country: 'Japan',
    phone: '+81 3 1234 5678',
    email: 'support@tokyocircuit.jp',
    rating: 4.8,
    reviews: 178,
    description:
      'Precision electronics repair - phones, tablets, laptops, gaming consoles, and circuit board soldering.',
    googleMapsUrl: buildGoogleMapsUrl(35.6762, 139.6503),
    images: [],
    isPremium: true,
    hours: 'Mon-Sat 10AM-8PM',
    services: ['Phone repair', 'Console repair', 'Soldering', 'Laptop logic board'],
  },
  {
    id: 'f9',
    name: 'Johannesburg Handyman',
    category: 'Home',
    lat: -26.2041,
    lng: 28.0473,
    address: '45 Main St, Rosebank',
    city: 'Johannesburg',
    country: 'South Africa',
    phone: '+27 11 555 7890',
    email: 'jobs@jhbhandyman.co.za',
    rating: 4.3,
    reviews: 54,
    description:
      'Reliable handyman for all household fixes - plumbing, electrical, carpentry, and general maintenance.',
    googleMapsUrl: buildGoogleMapsUrl(-26.2041, 28.0473),
    images: [],
    isPremium: false,
    hours: 'Mon-Fri 8AM-5PM',
    services: ['General repairs', 'Painting', 'Furniture assembly', 'Electrical basics'],
  },
  {
    id: 'f10',
    name: 'Mexico City Fridge Pro',
    category: 'Appliances',
    lat: 19.4326,
    lng: -99.1332,
    address: 'Av Juarez 88, Centro',
    city: 'Mexico City',
    country: 'Mexico',
    phone: '+52 55 1234 5678',
    email: 'hola@cdfridgepro.mx',
    rating: 4.6,
    reviews: 98,
    description:
      'Refrigerator and freezer repair specialists. Compressor replacement, gas refill, thermostat fixes.',
    googleMapsUrl: buildGoogleMapsUrl(19.4326, -99.1332),
    images: [],
    isPremium: false,
    hours: 'Mon-Sat 8AM-6PM',
    services: ['Fridge repair', 'Freezer fix', 'Compressor replace', 'Gas refill'],
  },
  {
    id: 'f11',
    name: 'Sydney Spark Electric',
    category: 'Home',
    lat: -33.8688,
    lng: 151.2093,
    address: '200 George St',
    city: 'Sydney',
    country: 'Australia',
    phone: '+61 2 9876 5432',
    email: 'book@sydneyspark.com.au',
    rating: 4.7,
    reviews: 143,
    description:
      'Licensed electricians for residential and commercial wiring, lighting, switchboard upgrades, and safety inspections.',
    googleMapsUrl: buildGoogleMapsUrl(-33.8688, 151.2093),
    images: [],
    isPremium: true,
    hours: 'Mon-Sat 7AM-7PM',
    services: ['Wiring', 'Lighting install', 'Switchboard upgrade', 'Safety inspection'],
  },
  {
    id: 'f12',
    name: 'Berlin Auto Werkstatt',
    category: 'Car',
    lat: 52.52,
    lng: 13.405,
    address: 'Karl-Marx-Allee 45',
    city: 'Berlin',
    country: 'Germany',
    phone: '+49 30 1234 5678',
    email: 'service@berlinautowerk.de',
    rating: 4.5,
    reviews: 112,
    description:
      'German precision auto repair - diagnostics, engine work, transmission, and classic car restoration.',
    googleMapsUrl: buildGoogleMapsUrl(52.52, 13.405),
    images: [],
    isPremium: false,
    hours: 'Mon-Fri 8AM-6PM',
    services: ['Diagnostics', 'Engine repair', 'Transmission', 'Classic restoration'],
  },
  {
    id: 'f13',
    name: 'Lagos Quick Fix HVAC',
    category: 'HVAC',
    lat: 6.5244,
    lng: 3.3792,
    address: '15 Allen Ave, Ikeja',
    city: 'Lagos',
    country: 'Nigeria',
    phone: '+234 803 123 4567',
    email: 'info@lagoshvac.ng',
    rating: 4.2,
    reviews: 76,
    description:
      'Air conditioning installation and repair for homes and offices across Lagos. Fast response times.',
    googleMapsUrl: buildGoogleMapsUrl(6.5244, 3.3792),
    images: [
      'https://picsum.photos/seed/plumbing3/400/300',
      'https://picsum.photos/seed/plumbing4/400/300',
    ],
    isPremium: true,
    hours: 'Mon-Sat 8AM-8PM',
    services: ['AC install', 'AC repair', 'Emergency response', 'Filter cleaning'],
  },
  {
    id: 'f14',
    name: 'Toronto Gadget Clinic',
    category: 'Electronics',
    lat: 43.6532,
    lng: -79.3832,
    address: '220 Yonge St',
    city: 'Toronto',
    country: 'Canada',
    phone: '+1 416 555 0198',
    email: 'fix@torontogadget.ca',
    rating: 4.8,
    reviews: 267,
    description:
      'Same-day phone and laptop screen repairs. Battery replacements, charging port fixes, and motherboard repair.',
    googleMapsUrl: buildGoogleMapsUrl(43.6532, -79.3832),
    images: [],
    isPremium: true,
    hours: 'Mon-Sat 10AM-8PM, Sun 12PM-5PM',
    services: ['Screen repair', 'Battery swap', 'Charging port', 'Motherboard'],
  },
  {
    id: 'f15',
    name: 'Sao Paulo Encanador Pro',
    category: 'Plumbing',
    lat: -23.5505,
    lng: -46.6333,
    address: 'Rua Augusta 1200',
    city: 'Sao Paulo',
    country: 'Brazil',
    phone: '+55 11 98765 4321',
    email: 'contato@spencanador.com.br',
    rating: 4.4,
    reviews: 134,
    description:
      'Professional plumbing services - leak detection, pipe replacement, bathroom remodeling, and emergency repairs.',
    googleMapsUrl: buildGoogleMapsUrl(-23.5505, -46.6333),
    images: [],
    isPremium: false,
    hours: 'Mon-Sat 7AM-8PM',
    services: ['Leak detection', 'Pipe replace', 'Bathroom remodel', 'Emergency'],
  },
];

const businessApplications: BusinessApplication[] = [
  {
    id: 'app-1',
    name: 'QuickFix Plumbing Manila',
    category: 'Plumbing',
    address: '123 Mabini St, Ermita',
    city: 'Manila',
    country: 'Philippines',
    phone: '+63 912 345 6789',
    email: 'quickfix@email.ph',
    description: 'Emergency plumbing services available 24/7',
    googleMapsUrl: buildGoogleMapsUrl(14.5995, 120.9842),
    submittedAt: '2026-04-20T10:00:00Z',
    status: 'pending',
    lat: 14.5995,
    lng: 120.9842,
    logoUrl: '/logo.png',
    imageUrl: '/fix.png',
  },
  {
    id: 'app-2',
    name: 'Berlin Tech Repair',
    category: 'Electronics',
    address: 'Friedrichstrasse 100',
    city: 'Berlin',
    country: 'Germany',
    phone: '+49 30 1234 5678',
    email: 'repair@berlintech.de',
    description: 'Phone and laptop repair service',
    googleMapsUrl: buildGoogleMapsUrl(52.52, 13.405),
    submittedAt: '2026-04-21T14:30:00Z',
    status: 'pending',
    lat: 52.52,
    lng: 13.405,
    logoUrl: '/logo.png',
    imageUrl: '/fix.png',
  },
  {
    id: 'app-3',
    name: 'Nairobi Home Solutions',
    category: 'Home',
    address: 'Kenyatta Ave 45',
    city: 'Nairobi',
    country: 'Kenya',
    phone: '+254 712 345 678',
    email: 'info@nairobihome.co.ke',
    description: 'General home repairs and maintenance',
    googleMapsUrl: buildGoogleMapsUrl(-1.286389, 36.817223),
    submittedAt: '2026-04-22T09:15:00Z',
    status: 'verified',
    lat: -1.286389,
    lng: 36.817223,
    logoUrl: '/logo.png',
    imageUrl: '/fix.png',
  },
];

export const MOCK_FIXERS = seedFixers;

export function getPublishedFixers(): FixerBusiness[] {
  return [
    ...businessApplications
      .filter((application) => application.status === 'verified')
      .map(applicationToFixer),
    ...seedFixers,
  ];
}

export function getFixerById(id: string): FixerBusiness | undefined {
  return getPublishedFixers().find((fixer) => fixer.id === id);
}

export function getFixersByCategory(category: FixerCategory): FixerBusiness[] {
  const publishedFixers = getPublishedFixers();
  if (category === 'All') {
    return publishedFixers;
  }

  return publishedFixers.filter((fixer) => fixer.category === category);
}

export function getBusinessApplications(): BusinessApplication[] {
  return businessApplications.map((application) => ({ ...application }));
}

export function getVerifiedBusinessListings(): BusinessApplication[] {
  return [
    ...businessApplications
      .filter((application) => application.status === 'verified')
      .map((application) => ({ ...application })),
    ...seedFixers.map(fixerToBusinessApplication),
  ];
}

export function submitBusinessApplication(input: SubmittedFixerInput): BusinessApplication {
  const parsedCoordinates = parseCoordinatesFromGoogleMapsUrl(input.googleMapsUrl);
  const safeLat = Number.isFinite(input.lat)
    ? Number(input.lat)
    : parsedCoordinates?.lat ?? DEFAULT_LAT;
  const safeLng = Number.isFinite(input.lng)
    ? Number(input.lng)
    : parsedCoordinates?.lng ?? DEFAULT_LNG;
  const logoUrl = normalizeImageUrl(input.logoUrl);
  const imageUrl = normalizeImageUrl(input.imageUrl);

  const created: BusinessApplication = {
    id: `app-${Date.now()}`,
    name: input.name.trim() || 'New Business',
    category: normalizeCategory(input.category),
    address: input.address.trim() || 'No address provided',
    city: input.city.trim() || 'Unknown City',
    country: input.country.trim() || 'Unknown Country',
    phone: input.phone.trim() || 'N/A',
    email: input.email.trim() || 'N/A',
    description: input.description.trim() || 'New business application',
    googleMapsUrl: normalizeGoogleMapsUrl(input.googleMapsUrl, safeLat, safeLng),
    submittedAt: DEFAULT_SUBMITTED_AT,
    status: 'pending',
    lat: safeLat,
    lng: safeLng,
    logoUrl,
    imageUrl,
  };

  businessApplications.unshift(created);
  return { ...created };
}

export function updateBusinessApplicationStatus(
  id: string,
  status: BusinessApplicationStatus
): BusinessApplication | undefined {
  const application = businessApplications.find((item) => item.id === id);
  if (!application) {
    return undefined;
  }

  application.status = status;
  return { ...application };
}

export function updateBusinessListing(
  id: string,
  updated: BusinessApplication
): BusinessApplication | undefined {
  const parsedCoordinates = parseCoordinatesFromGoogleMapsUrl(updated.googleMapsUrl);

  const application = businessApplications.find((item) => item.id === id);
  if (application) {
    const nextLat = Number.isFinite(updated.lat)
      ? Number(updated.lat)
      : parsedCoordinates?.lat ?? application.lat;
    const nextLng = Number.isFinite(updated.lng)
      ? Number(updated.lng)
      : parsedCoordinates?.lng ?? application.lng;

    Object.assign(application, {
      ...updated,
      category: normalizeCategory(updated.category),
      logoUrl: normalizeImageUrl(updated.logoUrl),
      imageUrl: normalizeImageUrl(updated.imageUrl),
      lat: nextLat,
      lng: nextLng,
      googleMapsUrl: normalizeGoogleMapsUrl(updated.googleMapsUrl, nextLat, nextLng),
    });
    return { ...application };
  }

  const fixer = seedFixers.find((item) => item.id === id);
  if (!fixer) {
    return undefined;
  }

  fixer.name = updated.name.trim() || fixer.name;
  fixer.category = normalizeCategory(updated.category);
  fixer.address = updated.address.trim() || fixer.address;
  fixer.city = updated.city.trim() || fixer.city;
  fixer.country = updated.country.trim() || fixer.country;
  fixer.phone = updated.phone.trim() || fixer.phone;
  fixer.email = updated.email.trim() || fixer.email;
  fixer.description = updated.description.trim() || fixer.description;
  fixer.lat = Number.isFinite(updated.lat)
    ? Number(updated.lat)
    : parsedCoordinates?.lat ?? fixer.lat;
  fixer.lng = Number.isFinite(updated.lng)
    ? Number(updated.lng)
    : parsedCoordinates?.lng ?? fixer.lng;
  fixer.googleMapsUrl = normalizeGoogleMapsUrl(updated.googleMapsUrl, fixer.lat, fixer.lng);
  fixer.logoUrl = normalizeImageUrl(updated.logoUrl);
  fixer.images = updated.imageUrl ? [updated.imageUrl] : [];

  return fixerToBusinessApplication(fixer);
}

export function deleteBusinessListing(id: string): boolean {
  const applicationIndex = businessApplications.findIndex((item) => item.id === id);
  if (applicationIndex >= 0) {
    businessApplications.splice(applicationIndex, 1);
    return true;
  }

  const fixerIndex = seedFixers.findIndex((item) => item.id === id);
  if (fixerIndex >= 0) {
    seedFixers.splice(fixerIndex, 1);
    return true;
  }

  return false;
}

export function addSubmittedFixer(input: SubmittedFixerInput): FixerBusiness {
  const submitted = submitBusinessApplication(input);
  updateBusinessApplicationStatus(submitted.id, 'verified');
  return applicationToFixer({
    ...submitted,
    status: 'verified',
  });
}

function applicationToFixer(application: BusinessApplication): FixerBusiness {
  return {
    id: application.id,
    name: application.name,
    category: application.category,
    lat: application.lat,
    lng: application.lng,
    address: application.address,
    city: application.city,
    country: application.country,
    phone: application.phone,
    email: application.email,
    rating: 5,
    reviews: 0,
    description: application.description,
    googleMapsUrl: application.googleMapsUrl,
    logoUrl: application.logoUrl,
    images: application.imageUrl ? [application.imageUrl] : [],
    isPremium: true,
    hours: 'By appointment',
    services: ['General service'],
  };
}

function fixerToBusinessApplication(fixer: FixerBusiness): BusinessApplication {
  return {
    id: fixer.id,
    name: fixer.name,
    category: fixer.category,
    address: fixer.address,
    city: fixer.city,
    country: fixer.country,
    phone: fixer.phone,
    email: fixer.email,
    description: fixer.description,
    googleMapsUrl: buildGoogleMapsUrl(fixer.lat, fixer.lng),
    submittedAt: DEFAULT_SUBMITTED_AT,
    status: 'verified',
    lat: fixer.lat,
    lng: fixer.lng,
    logoUrl: fixer.logoUrl,
    imageUrl: fixer.images[0],
  };
}

function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

function normalizeCategory(category: string): BusinessCategory {
  return FIXER_CATEGORIES.includes(category as FixerCategory) && category !== 'All'
    ? (category as BusinessCategory)
    : 'Home';
}

function normalizeImageUrl(imageUrl?: string): string | undefined {
  const trimmed = imageUrl?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeGoogleMapsUrl(
  googleMapsUrl: string | undefined,
  lat: number,
  lng: number
): string {
  const trimmed = googleMapsUrl?.trim();
  return trimmed ? trimmed : buildGoogleMapsUrl(lat, lng);
}

function parseCoordinatesFromGoogleMapsUrl(
  googleMapsUrl?: string
): { lat: number; lng: number } | undefined {
  const trimmed = googleMapsUrl?.trim();
  if (!trimmed) {
    return undefined;
  }

  const patterns = [
    /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (!match) {
      continue;
    }

    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng };
    }
  }

  return undefined;
}
