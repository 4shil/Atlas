import type { Goal } from '../store/useGoalStore';

interface MapWrapperProps {
    goals: Goal[];
    recenterTrigger?: number;
    isFullscreen?: boolean;
    mapStyle?: 'standard' | 'satellite';
}

export default function MapWrapper(props: MapWrapperProps): JSX.Element;
