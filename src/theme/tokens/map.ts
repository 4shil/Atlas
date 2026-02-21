/**
 * Atlas Design System — Map Tokens
 */

import type { MapStyleElement } from 'react-native-maps';
import { rawColors } from './colors';

export const cinematicDarkMapStyle: MapStyleElement[] = [
    {
        elementType: 'geometry',
        stylers: [{ color: rawColors.gray[900] }],
    },
    {
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }],
    },
    {
        elementType: 'labels.text.fill',
        stylers: [{ color: rawColors.gray[500] }],
    },
    {
        elementType: 'labels.text.stroke',
        stylers: [{ color: rawColors.gray[900] }],
    },
    {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ color: rawColors.gray[500] }],
    },
    {
        featureType: 'administrative.country',
        elementType: 'labels.text.fill',
        stylers: [{ color: rawColors.gray[300] }],
    },
    {
        featureType: 'administrative.land_parcel',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: rawColors.gray[300] }],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: rawColors.gray[500] }],
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: rawColors.gray[900] }],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: rawColors.gray[700] }],
    },
    {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{ color: rawColors.gray[500] }],
    },
    {
        featureType: 'transit',
        elementType: 'labels.text.fill',
        stylers: [{ color: rawColors.gray[500] }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: rawColors.black }],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: rawColors.gray[700] }],
    },
];
