export const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Travel': return 'flight-takeoff';
        case 'Adventures': return 'hiking';
        case 'Foodie': return 'restaurant';
        case 'Stays': return 'hotel';
        case 'Milestone': return 'star';
        default: return 'place';
    }
};
