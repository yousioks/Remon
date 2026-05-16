import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input for safe HTML rendering.
 * Removes all potentially dangerous tags and attributes.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize plain text — removes ALL HTML, returns plain text.
 */
export function sanitizeText(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
