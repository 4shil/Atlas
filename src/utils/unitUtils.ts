/**
 * Unit conversion utilities
 * Reads from useSettingsStore.unitSystem
 */

export type UnitSystem = 'metric' | 'imperial';

export function formatDistance(km: number, system: UnitSystem): string {
    if (system === 'imperial') {
        const miles = km * 0.621371;
        return miles < 0.1 ? `${Math.round(miles * 5280)} ft` : `${miles.toFixed(1)} mi`;
    }
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function formatTemperature(celsius: number, system: UnitSystem): string {
    if (system === 'imperial') {
        return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
}

export function formatElevation(meters: number, system: UnitSystem): string {
    if (system === 'imperial') {
        return `${Math.round(meters * 3.28084)} ft`;
    }
    return `${Math.round(meters)} m`;
}
