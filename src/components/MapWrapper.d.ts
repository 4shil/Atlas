import type { Goal } from '../store/useGoalStore';
import type { Attraction } from '../hooks/useNearbyAttractions';

export interface LatLng {
    latitude: number;
    longitude: number;
}

interface MapWrapperProps {
    goals: Goal[];
    recenterTrigger?: number;
    isFullscreen?: boolean;
    mapStyle?: 'standard' | 'satellite';
    flyToCoords?: LatLng | null;
    attractions?: Attraction[];
    onAttractionPress?: (attraction: Attraction) => void;
}

export default function MapWrapper(props: MapWrapperProps): JSX.Element;
