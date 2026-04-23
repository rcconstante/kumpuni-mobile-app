import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

const LOCATION_KEY = '@kumpuni_user_location';

export interface UserLocation {
  lat: number;
  lng: number;
  address: string;
}

let inMemoryLocation: UserLocation | null = null;

async function readStoredLocation(): Promise<UserLocation | null> {
  if (typeof globalThis.localStorage === 'undefined') {
    return inMemoryLocation;
  }

  try {
    const saved = globalThis.localStorage.getItem(LOCATION_KEY);
    if (!saved) {
      return null;
    }

    return JSON.parse(saved) as UserLocation;
  } catch (error) {
    console.error('Failed to load saved location', error);
    return null;
  }
}

async function writeStoredLocation(location: UserLocation | null): Promise<void> {
  inMemoryLocation = location;

  if (typeof globalThis.localStorage === 'undefined') {
    return;
  }

  try {
    if (location) {
      globalThis.localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
    } else {
      globalThis.localStorage.removeItem(LOCATION_KEY);
    }
  } catch (error) {
    console.error('Failed to persist location', error);
  }
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(inMemoryLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const savedLocation = await readStoredLocation();
      if (mounted && savedLocation) {
        setLocation(savedLocation);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const saveLocation = useCallback(async (nextLocation: UserLocation) => {
    setLocation(nextLocation);
    await writeStoredLocation(nextLocation);
  }, []);

  const getGPSLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const addressParts = geocode[0]
        ? [geocode[0].street, geocode[0].city, geocode[0].region, geocode[0].country]
        : [];
      const address =
        addressParts.filter(Boolean).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      await saveLocation({ lat, lng, address });
    } catch (storageError) {
      setError('Failed to get GPS location');
      console.error(storageError);
    } finally {
      setLoading(false);
    }
  }, [saveLocation]);

  const geocodeAddress = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'KumpuniApp/1.0' },
        });
        const data = await response.json();

        if (!data || data.length === 0) {
          setError('Location not found. Try a different search.');
          return;
        }

        const place = data[0];
        await saveLocation({
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
          address: place.display_name,
        });
      } catch (searchError) {
        setError('Failed to search location');
        console.error(searchError);
      } finally {
        setLoading(false);
      }
    },
    [saveLocation]
  );

  const clearLocation = useCallback(async () => {
    setLocation(null);
    await writeStoredLocation(null);
  }, []);

  return {
    location,
    loading,
    error,
    getGPSLocation,
    geocodeAddress,
    saveLocation,
    clearLocation,
  };
}
