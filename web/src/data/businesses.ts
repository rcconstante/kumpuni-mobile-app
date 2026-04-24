import {
  BUSINESS_IMAGES_BUCKET,
  PAYMENT_PROOFS_BUCKET,
  supabase,
} from '../lib/supabase';
import { safeHttpUrl } from '../lib/safeUrl';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

// ---------------------------------------------------------------------------
// Types (kept in sync with mobile `data/fixers.ts`)
// ---------------------------------------------------------------------------
export type BusinessApplicationStatus = 'pending' | 'verified' | 'rejected';
export type BusinessCategory = 'Home' | 'Plumbing' | 'Electronics' | 'Car' | 'Appliances' | 'HVAC';

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
  isPremium?: boolean;
  hours?: string;
  rating?: number;
  reviews?: number;
  paymentProofPath?: string;
  paymentReference?: string;
}

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
  hours: string | null;
  rating: number;
  reviews: number;
  is_premium: boolean;
  status: BusinessApplicationStatus;
  submitted_at: string;
  payment_proof_path: string | null;
  payment_reference: string | null;
}

const SELECT_COLS =
  'id,name,category,address,city,country,phone,email,description,google_maps_url,' +
  'lat,lng,logo_url,image_url,hours,rating,reviews,is_premium,status,submitted_at,' +
  'payment_proof_path,payment_reference';

function rowToApplication(row: BusinessRow): BusinessApplication {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    address: row.address,
    city: row.city,
    country: row.country,
    phone: row.phone,
    email: row.email,
    description: row.description,
    googleMapsUrl: row.google_maps_url || `https://maps.google.com/?q=${row.lat},${row.lng}`,
    submittedAt: row.submitted_at,
    status: row.status,
    lat: row.lat,
    lng: row.lng,
    logoUrl: row.logo_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    isPremium: row.is_premium,
    hours: row.hours ?? undefined,
    rating: Number(row.rating ?? 5),
    reviews: row.reviews ?? 0,
    paymentProofPath: row.payment_proof_path ?? undefined,
    paymentReference: row.payment_reference ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Read APIs
// ---------------------------------------------------------------------------
export async function fetchBusinessApplications(): Promise<BusinessApplication[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select(SELECT_COLS)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.warn('[supabase] fetchBusinessApplications failed:', error.message);
    return [];
  }
  return ((data as BusinessRow[]) ?? []).map(rowToApplication);
}

export async function fetchVerifiedBusinesses(): Promise<BusinessApplication[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select(SELECT_COLS)
    .eq('status', 'verified')
    .order('is_premium', { ascending: false })
    .order('submitted_at', { ascending: false });

  if (error) {
    console.warn('[supabase] fetchVerifiedBusinesses failed:', error.message);
    return [];
  }
  return ((data as BusinessRow[]) ?? []).map(rowToApplication);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
export async function updateBusinessApplicationStatus(
  id: string,
  status: BusinessApplicationStatus
): Promise<BusinessApplication | undefined> {
  const { data, error } = await supabase
    .from('businesses')
    .update({ status })
    .eq('id', id)
    .select(SELECT_COLS)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not update status: ${error.message}`);
  }
  return data ? rowToApplication(data as BusinessRow) : undefined;
}

export async function updateBusinessListing(
  id: string,
  updated: BusinessApplication
): Promise<BusinessApplication | undefined> {
  const lat = Number.isFinite(updated.lat) ? Number(updated.lat) : 0;
  const lng = Number.isFinite(updated.lng) ? Number(updated.lng) : 0;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw new Error('Coordinates are out of range.');
  }

  const safeMaps = safeHttpUrl(updated.googleMapsUrl);
  if (updated.googleMapsUrl?.trim() && !safeMaps) {
    throw new Error('Google Maps link must be http(s).');
  }
  const safeLogo = updated.logoUrl?.trim() ? safeHttpUrl(updated.logoUrl) : null;
  if (updated.logoUrl?.trim() && !safeLogo) {
    throw new Error('Logo URL must be http(s).');
  }
  const safeImage = updated.imageUrl?.trim() ? safeHttpUrl(updated.imageUrl) : null;
  if (updated.imageUrl?.trim() && !safeImage) {
    throw new Error('Image URL must be http(s).');
  }

  const { data, error } = await supabase
    .from('businesses')
    .update({
      // Whitelist of admin-mutable columns. Status / payment_* / submitted_at
      // are intentionally excluded — status uses its own RPC, the others are
      // immutable post-submission.
      name: updated.name.trim().slice(0, 120),
      category: updated.category,
      address: updated.address.trim().slice(0, 240),
      city: updated.city.trim().slice(0, 80),
      country: updated.country.trim().slice(0, 80),
      phone: updated.phone.trim().slice(0, 40),
      email: updated.email.trim().slice(0, 160).toLowerCase(),
      description: updated.description.trim().slice(0, 2000),
      google_maps_url: (safeMaps ?? `https://maps.google.com/?q=${lat},${lng}`).slice(0, 500),
      lat,
      lng,
      logo_url: safeLogo ?? null,
      image_url: safeImage ?? null,
      hours: updated.hours?.trim().slice(0, 80) || null,
      is_premium: !!updated.isPremium,
    })
    .eq('id', id)
    .select(SELECT_COLS)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not update business: ${error.message}`);
  }
  return data ? rowToApplication(data as BusinessRow) : undefined;
}

export async function deleteBusinessListing(id: string): Promise<boolean> {
  const { error } = await supabase.from('businesses').delete().eq('id', id);
  if (error) {
    throw new Error(`Could not delete business: ${error.message}`);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Image upload helper (admin)
// ---------------------------------------------------------------------------
export async function uploadAdminImage(file: File, prefix: 'logo' | 'highlight'): Promise<string> {
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    throw new Error('Image must be PNG, JPEG, WEBP or GIF.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large (max 5 MB).');
  }
  const ext = (() => {
    if (file.type.includes('png')) return 'png';
    if (file.type.includes('webp')) return 'webp';
    if (file.type.includes('gif')) return 'gif';
    return 'jpg';
  })();
  const rand =
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10);
  const path = `${prefix}/${Date.now()}-${rand}.${ext}`;

  const { error } = await supabase.storage
    .from(BUSINESS_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUSINESS_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Generates a short-lived signed URL so an admin can preview a private payment
 * proof. The bucket is non-public; without the signed URL the file is
 * unreadable.
 */
export async function getPaymentProofSignedUrl(
  path: string | null | undefined,
  expiresInSec = 60,
): Promise<string | null> {
  if (!path) return null;
  // Hard guard: only allow paths inside the payment-proofs bucket.
  if (!/^payment-proofs\/[A-Za-z0-9._/-]{1,200}$/.test(path)) return null;
  const objectPath = path.replace(/^payment-proofs\//, '');
  const { data, error } = await supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .createSignedUrl(objectPath, expiresInSec);
  if (error) {
    console.warn('[supabase] signed URL failed:', error.message);
    return null;
  }
  return data.signedUrl;
}
