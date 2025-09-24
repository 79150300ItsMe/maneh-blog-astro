/**
 * Utility functions for URL slug generation
 */

/**
 * Create a URL-safe slug from a tag name
 * @param input - The tag name to convert
 * @returns URL-safe slug
 */
export function slugifyTag(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .normalize('NFD') // Normalize to NFD form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate tag URL
 * @param tag - The tag name
 * @returns Tag URL
 */
export function getTagUrl(tag: string): string {
  return `/tag/${slugifyTag(tag)}`;
}

/**
 * Generate hash-based tag URL (for backward compatibility)
 * @param tag - The tag name
 * @returns Hash-based tag URL
 */
export function getTagHashUrl(tag: string): string {
  return `/#tag/${slugifyTag(tag)}`;
}

/**
 * Check if a tag matches another tag after normalization
 * @param tagFromURL - Tag from URL parameter
 * @param articleTag - Tag from article
 * @returns True if tags match after normalization
 */
export function isTagMatch(tagFromURL: string, articleTag: string): boolean {
  if (!tagFromURL || !articleTag) return false;
  
  const normalizedURL = slugifyTag(tagFromURL);
  const normalizedArticle = slugifyTag(articleTag);
  
  return normalizedURL === normalizedArticle;
}
