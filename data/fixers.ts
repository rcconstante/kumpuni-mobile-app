import {
  BUSINESS_IMAGES_BUCKET,
  PAYMENT_PROOFS_BUCKET,
  supabase,
} from '@/lib/supabase';
import { safeHttpUrl, safeImageUrl } from '@/lib/safeUrl';

// Hard limits enforced client-side (mirrors DB CHECK constraints + storage).
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;          // 5 MB
const MAX_FIELD_LEN = {
  name: 120,
  address: 240,
  city: 80,
  country: 80,
  phone: 40,
  email: 160,
  description: 2000,
  googleMapsUrl: 500,
  paymentReference: 120,
};
const ALLOWED_IMAGE_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);
const ALLOWED_PROOF_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
]);

function clamp(value: string | undefined, max: number): string {
  return (value ?? '').toString().trim().slice(0, max);
}
function stripControlChars(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, '');
}

/**
 * Convert a base64 string to a Uint8Array. Avoids depending on `atob`
 * (which may not exist on all RN runtimes) or extra packages.
 */
function base64ToBytes(base64: string): Uint8Array {
  const cleaned = base64.replace(/\s+/g, '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = (cleaned.length * 3) >> 2;
  if (cleaned.endsWith('==')) bufferLength -= 2;
  else if (cleaned.endsWith('=')) bufferLength -= 1;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < cleaned.length; i += 4) {
    const e1 = lookup[cleaned.charCodeAt(i)];
    const e2 = lookup[cleaned.charCodeAt(i + 1)];
    const e3 = lookup[cleaned.charCodeAt(i + 2)];
    const e4 = lookup[cleaned.charCodeAt(i + 3)];
    if (p < bufferLength) bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (p < bufferLength) bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    if (p < bufferLength) bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
  }
  return bytes;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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
  images?: string[];              // additional highlight photos (data: URIs)
  googleMapsUrl?: string;
  lat?: number;
  lng?: number;
  paymentProof?: string;          // data: URI from image picker (required)
  paymentReference?: string;      // optional reference number / sender name
};

const DEFAULT_LAT = 14.5995;
const DEFAULT_LNG = 120.9842;

interface BusinessRow {
  id: string;
  name: string;
  category: BusinessCategory;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  description: string;
  google_maps_url: string;
  lat: number;
  lng: number;
  logo_url: string | null;
  image_url: string | null;
  images: string[] | null;
  services: string[] | null;
  hours: string | null;
  rating: number;
  reviews: number;
  is_premium: boolean;
  status: BusinessApplicationStatus;
  submitted_at: string;
}

const SELECT_COLS =
  'id,name,category,address,city,country,phone,email,description,google_maps_url,' +
  'lat,lng,logo_url,image_url,images,services,hours,rating,reviews,is_premium,status,submitted_at';

function rowToFixer(row: BusinessRow): FixerBusiness {
  const extraImages = (row.images ?? []).filter(Boolean);
  const heroImage = row.image_url ? [row.image_url] : [];
  return {
    id: row.id,
    name: row.name,
    category: normalizeCategory(row.category),
    lat: row.lat,
    lng: row.lng,
    address: row.address,
    city: row.city,
    country: row.country,
    phone: row.phone,
    email: row.email,
    rating: Number(row.rating ?? 5),
    reviews: row.reviews ?? 0,
    description: row.description,
    googleMapsUrl: row.google_maps_url || buildGoogleMapsUrl(row.lat, row.lng),
    logoUrl: row.logo_url ?? undefined,
    images: [...heroImage, ...extraImages],
    isPremium: !!row.is_premium,
    hours: row.hours ?? undefined,
    services: row.services ?? undefined,
  };
}

function rowToApplication(row: BusinessRow): BusinessApplication {
  return {
    id: row.id,
    name: row.name,
    category: normalizeCategory(row.category),
    address: row.address,
    city: row.city,
    country: row.country,
    phone: row.phone,
    email: row.email,
    description: row.description,
    googleMapsUrl: row.google_maps_url || buildGoogleMapsUrl(row.lat, row.lng),
    submittedAt: row.submitted_at,
    status: row.status,
    lat: row.lat,
    lng: row.lng,
    logoUrl: row.logo_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Image upload (storage)
// ---------------------------------------------------------------------------
function inferExtension(mime?: string | null): string {
  if (!mime) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('pdf')) return 'pdf';
  return 'jpg';
}

function randomFilename(prefix: string, ext: string): string {
  // Time + 96-bit random — no user input goes into the path.
  const rand =
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10);
  return `${prefix}/${Date.now()}-${rand}.${ext}`;
}

function parseDataUri(source: string): { mime: string; base64: string } {
  const match = source.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) throw new Error('Unsupported image format.');
  return { mime: match[1].toLowerCase(), base64: match[2] };
}

/**
 * Accepts either a `data:<mime>;base64,...` URI or a remote `https://...`
 * URL. Remote URLs are validated to be http(s) and returned unchanged. Data
 * URIs are validated for mime/size and uploaded to the `business-images`
 * bucket; the public URL is returned.
 */
export async function uploadBusinessImage(
  source: string | null | undefined,
  prefix: 'logo' | 'highlight'
): Promise<string | undefined> {
  if (!source) return undefined;
  if (!source.startsWith('data:')) {
    const safe = safeImageUrl(source);
    if (!safe) throw new Error('Image URL must be http(s).');
    return safe;
  }

  const { mime, base64 } = parseDataUri(source);
  if (!ALLOWED_IMAGE_MIME.has(mime)) {
    throw new Error('Image must be PNG, JPEG, WEBP or GIF.');
  }
  const bytes = base64ToBytes(base64);
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large (max 5 MB).');
  }
  const ext = inferExtension(mime);
  const path = randomFilename(prefix, ext);

  const { error } = await supabase.storage
    .from(BUSINESS_IMAGES_BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: false });

  if (error) throw new Error(`Image upload failed: ${error.message}`);
  const { data } = supabase.storage.from(BUSINESS_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Uploads a payment-proof file (image or PDF) into the private
 * `payment-proofs` bucket and returns the **storage path** (not a public URL).
 * Admins generate signed URLs server-side to view it.
 */
export async function uploadPaymentProof(
  source: string | null | undefined
): Promise<string | undefined> {
  if (!source) return undefined;
  if (!source.startsWith('data:')) {
    throw new Error('Payment proof must be an uploaded file.');
  }
  const { mime, base64 } = parseDataUri(source);
  if (!ALLOWED_PROOF_MIME.has(mime)) {
    throw new Error('Payment proof must be PNG, JPEG, WEBP or PDF.');
  }
  const bytes = base64ToBytes(base64);
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('Payment proof is too large (max 5 MB).');
  }
  const ext = inferExtension(mime);
  const path = randomFilename('payment-proofs', ext);
  const { error } = await supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (error) throw new Error(`Payment proof upload failed: ${error.message}`);
  return path;
}

// ---------------------------------------------------------------------------
// Public read APIs (mobile app)
// ---------------------------------------------------------------------------
export async function getPublishedFixers(): Promise<FixerBusiness[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select(SELECT_COLS)
    .eq('status', 'verified')
    .order('is_premium', { ascending: false })
    .order('submitted_at', { ascending: false });

  if (error) {
    console.warn('[supabase] getPublishedFixers failed:', error.message);
    return [];
  }
  return ((data as unknown as BusinessRow[]) ?? []).map(rowToFixer);
}

export async function getFixerById(id: string): Promise<FixerBusiness | undefined> {
  if (!id) return undefined;
  const { data, error } = await supabase
    .from('businesses')
    .select(SELECT_COLS)
    .eq('id', id)
    .eq('status', 'verified')
    .maybeSingle();

  if (error) {
    console.warn('[supabase] getFixerById failed:', error.message);
    return undefined;
  }
  return data ? rowToFixer(data as unknown as BusinessRow) : undefined;
}

export async function getFixersByCategory(category: FixerCategory): Promise<FixerBusiness[]> {
  const all = await getPublishedFixers();
  if (category === 'All') return all;
  return all.filter((f) => f.category === category);
}

// ---------------------------------------------------------------------------
// Public write APIs (apply form)
// ---------------------------------------------------------------------------
export async function submitBusinessApplication(
  input: SubmittedFixerInput
): Promise<BusinessApplication> {
  // ---- 1. Validate / clamp every field ------------------------------------
  const name = clamp(stripControlChars(input.name), MAX_FIELD_LEN.name) || 'New Business';
  const address = clamp(stripControlChars(input.address), MAX_FIELD_LEN.address);
  const city = clamp(stripControlChars(input.city), MAX_FIELD_LEN.city);
  const country = clamp(stripControlChars(input.country), MAX_FIELD_LEN.country);
  const phone = clamp(stripControlChars(input.phone), MAX_FIELD_LEN.phone);
  const email = clamp(stripControlChars(input.email), MAX_FIELD_LEN.email).toLowerCase();
  const description = clamp(input.description, MAX_FIELD_LEN.description);
  const paymentReference = clamp(
    stripControlChars(input.paymentReference ?? ''),
    MAX_FIELD_LEN.paymentReference,
  );

  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(email)) {
    throw new Error('Please provide a valid email address.');
  }

  const safeMapsInput = clamp(stripControlChars(input.googleMapsUrl ?? ''), MAX_FIELD_LEN.googleMapsUrl);
  const sanitizedMaps = safeHttpUrl(safeMapsInput);
  if (safeMapsInput && !sanitizedMaps) {
    throw new Error('Google Maps link must be a valid http(s) URL.');
  }

  const parsedCoordinates = parseCoordinatesFromGoogleMapsUrl(sanitizedMaps ?? undefined);
  const lat = Number.isFinite(input.lat)
    ? Number(input.lat)
    : parsedCoordinates?.lat ?? DEFAULT_LAT;
  const lng = Number.isFinite(input.lng)
    ? Number(input.lng)
    : parsedCoordinates?.lng ?? DEFAULT_LNG;

  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw new Error('Coordinates are out of range.');
  }

  // ---- 2. Upload images + payment proof in parallel -----------------------
  const extraSources = (input.images ?? []).filter(Boolean).slice(0, 4);
  const [logoUrl, imageUrl, paymentProofPath, ...extraUrls] = await Promise.all([
    uploadBusinessImage(input.logoUrl, 'logo'),
    uploadBusinessImage(input.imageUrl, 'highlight'),
    uploadPaymentProof(input.paymentProof),
    ...extraSources.map((src) => uploadBusinessImage(src, 'highlight')),
  ]);

  if (!paymentProofPath) {
    throw new Error('Payment proof screenshot is required.');
  }

  const additionalImages = extraUrls.filter(Boolean) as string[];

  const row = {
    name,
    category: normalizeCategory(input.category),
    address,
    city,
    country,
    phone,
    email,
    description,
    google_maps_url: normalizeGoogleMapsUrl(sanitizedMaps ?? undefined, lat, lng),
    lat,
    lng,
    logo_url: normalizeImageUrl(logoUrl) ?? null,
    image_url: normalizeImageUrl(imageUrl) ?? null,
    images: additionalImages.length > 0 ? additionalImages : null,
    payment_proof_path: paymentProofPath,
    payment_reference: paymentReference,
    status: 'pending' as BusinessApplicationStatus,
    // Server trigger will re-stamp these regardless, but be explicit.
    is_premium: false,
    rating: 5.0,
    reviews: 0,
  };

  const { data, error } = await supabase
    .from('businesses')
    .insert(row)
    .select(SELECT_COLS)
    .single();

  if (error) {
    throw new Error(`Could not submit application: ${error.message}`);
  }
  return rowToApplication(data as unknown as BusinessRow);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

function normalizeCategory(category: string): BusinessCategory {
  return FIXER_CATEGORIES.includes(category as FixerCategory) && category !== 'All'
    ? (category as BusinessCategory)
    : 'Home';
}

function normalizeImageUrl(imageUrl?: string | null): string | undefined {
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
  if (!trimmed) return undefined;

  const patterns = [
    /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i,
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (!match) continue;

    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
    ) {
      return { lat, lng };
    }
  }
  return undefined;
}
