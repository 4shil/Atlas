/**
 * Supabase image CDN transform utilities.
 * Appends width/quality params to Supabase Storage URLs for faster loading.
 */

export function getThumbnailUrl(url: string, width = 400): string {
    if (!url || !url.includes('supabase')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=70`;
}

export function getDetailUrl(url: string): string {
    if (!url || !url.includes('supabase')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=800&quality=80`;
}
