import { useMemo } from 'react';
import { FixerBusiness, getPublishedFixers } from '@/data/fixers';

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type SortMode = 'nearest' | 'rating' | 'reviews';

export function useNearbyFixers(
  userLat: number,
  userLng: number,
  radiusKm: number,
  category: string,
  sort: SortMode
): FixerBusiness[] {
  return useMemo(() => {
    let filtered = getPublishedFixers().filter((f) => {
      const dist = haversineDistance(userLat, userLng, f.lat, f.lng);
      if (dist > radiusKm) return false;
      if (category !== 'All' && f.category !== category) return false;
      return true;
    });

    // Compute distance and attach
    filtered = filtered.map((f) => ({
      ...f,
      _distance: haversineDistance(userLat, userLng, f.lat, f.lng),
    })) as any;

    if (sort === 'nearest') {
      filtered.sort((a, b) => (a as any)._distance - (b as any)._distance);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'reviews') {
      filtered.sort((a, b) => b.reviews - a.reviews);
    }

    return filtered;
  }, [userLat, userLng, radiusKm, category, sort]);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${(km * 1000).toFixed(0)} m`;
  }
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}
