import type { Goal } from '../store/useGoalStore';

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
}

export default function MapWrapper(props: MapWrapperProps): JSX.Element;
