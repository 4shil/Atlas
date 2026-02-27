import type { Goal } from '../store/useGoalStore';

interface MapWrapperProps {
    goals: Goal[];
    recenterTrigger?: number;
}

export default function MapWrapper(props: MapWrapperProps): JSX.Element;
