import type { Goal } from '../store/useGoalStore';

interface MapWrapperProps {
    goals: Goal[];
}

export default function MapWrapper(props: MapWrapperProps): JSX.Element;
