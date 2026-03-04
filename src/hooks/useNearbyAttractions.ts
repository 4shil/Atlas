/**
 * useNearbyAttractions
 * Fetches nearby POIs from the Overpass API (OSM) — free, no API key.
 */
import { useState, useCallback } from 'react';

export type AttractionType =
    | 'cafe'
    | 'park'
    | 'landmark'
    | 'restaurant'
    | 'museum'
    | 'hotel'
    | 'shop';

export interface Attraction {
    id: string;
    name: string;
    type: AttractionType;
    latitude: number;
    longitude: number;
    tags?: Record<string, string>;
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function buildQuery(lat: number, lon: number, radiusM: number): string {
    return `
[out:json][timeout:10];
(
  node["amenity"="cafe"](around:${radiusM},${lat},${lon});
  node["amenity"="restaurant"](around:${radiusM},${lat},${lon});
  node["leisure"="park"](around:${radiusM},${lat},${lon});
  node["tourism"="museum"](around:${radiusM},${lat},${lon});
  node["tourism"="attraction"](around:${radiusM},${lat},${lon});
  node["tourism"="hotel"](around:${radiusM},${lat},${lon});
  node["historic"](around:${radiusM},${lat},${lon});
);
out body 30;
`.trim();
}

function tagToType(tags: Record<string, string>): AttractionType {
    if (tags.amenity === 'cafe') return 'cafe';
    if (tags.amenity === 'restaurant') return 'restaurant';
    if (tags.leisure === 'park') return 'park';
    if (tags.tourism === 'museum') return 'museum';
    if (tags.tourism === 'hotel') return 'hotel';
    if (tags.historic) return 'landmark';
    return 'landmark';
}

export function useNearbyAttractions() {
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [loading, setLoading] = useState(false);

    const fetch = useCallback(async (lat: number, lon: number, radiusM = 2000) => {
        setLoading(true);
        try {
            const query = buildQuery(lat, lon, radiusM);
            const res = await globalThis.fetch(OVERPASS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `data=${encodeURIComponent(query)}`,
            });
            if (!res.ok) return;
            const json = await res.json();
            const elements: Attraction[] = (json.elements ?? [])
                .filter((el: any) => el.tags?.name)
                .slice(0, 25)
                .map((el: any) => ({
                    id: String(el.id),
                    name: el.tags.name,
                    type: tagToType(el.tags),
                    latitude: el.lat,
                    longitude: el.lon,
                    tags: el.tags,
                }));
            setAttractions(elements);
        } catch (_) {}
        setLoading(false);
    }, []);

    const clear = useCallback(() => setAttractions([]), []);

    return { attractions, loading, fetchAttractions: fetch, clearAttractions: clear };
}
