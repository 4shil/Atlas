export const getDaysUntil = (isoDate: string) => {
    const diff = new Date(isoDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dateStr: string): boolean => {
    return getDaysUntil(dateStr) < 0;
};

export const formatRelativeDate = (dateStr: string): string => {
    const days = getDaysUntil(dateStr);
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    if (days === -1) return 'yesterday';
    if (days > 1) return `in ${days} days`;
    return `${Math.abs(days)} days ago`;
};
