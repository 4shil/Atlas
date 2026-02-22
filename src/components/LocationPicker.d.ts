interface LocationData {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
}

interface LocationPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (location: LocationData) => void;
    initialLocation?: LocationData | null;
}

export function LocationPicker(props: LocationPickerProps): JSX.Element | null;
